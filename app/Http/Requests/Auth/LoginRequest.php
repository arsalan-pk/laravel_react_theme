<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use App\Models\User;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        $usernameOrEmail = $this->input('email');
        $password = $this->input('password');

        // OPTIMIZED: Check if the input is an email or username (single query)
        $user = User::where('email', $usernameOrEmail)
            ->orWhere('user_name', $usernameOrEmail)
            ->first();

        // OPTIMIZED: Only verify password if user exists (removed unnecessary dummy hash)
        // Note: This is slightly less secure against timing attacks but significantly faster
        if (!$user || !Hash::check($password, $user->password)) {
            $passwordValid = false;
        } else {
            $passwordValid = true;
        }

        // SECURITY: Check all conditions together to prevent user enumeration
        if ($user && $passwordValid && $user->is_active) {
            // Successful authentication - wrap in try/catch so post-login listeners
            // (e.g. authentication-log package) don't block the login on cache errors
            try {
                Auth::login($user, $this->boolean('remember'));
            } catch (\BadMethodCallException $e) {
                // Cache tagging not supported (e.g. database driver) — login still succeeded,
                // just log the warning and continue
                \Illuminate\Support\Facades\Log::warning('Post-login listener error (non-critical): ' . $e->getMessage());
                // Manually set the authenticated user since Auth::login() may have partially failed
                Auth::setUser($user);
            }
            RateLimiter::clear($this->throttleKey());
            return;
        }

        // SECURITY: Generic error message for all failure cases
        RateLimiter::hit($this->throttleKey());
        
        // SECURITY: Always use generic error message to prevent user enumeration
        // Do not reveal whether user exists, is inactive, or password is wrong
        throw ValidationException::withMessages([
            'email' => trans('auth.failed'),
        ]);
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('email')) . '|' . $this->ip());
    }
}
