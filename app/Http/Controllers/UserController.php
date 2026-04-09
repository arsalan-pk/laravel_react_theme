<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class UserController extends Controller
{
    public function index()
    {
        $roles = Role::where('name', '!=', 'super-admin')->get();
        $users = User::select('id', 'name', 'user_name', 'user_role', 'email', 'created_at')
            ->where('user_role', '!=', 'super-admin')
            ->where('is_active', 1)
            ->get();

        return Inertia::render('User/User', [
            'users' => $users,
            'roles' => $roles,
            'pageLabel' => 'Users',
        ]);
    }

    public function userRole()
    {
        $roles = Role::with('permissions')->where('name', '!=', 'super-admin')->get()->map(function ($role) {
            // Map each role to include a comma-separated list of permissions
            $role->permissions_list = $role->permissions->pluck('name')->join(', ');

            return $role;
        });
        $permissions = Permission::select('id', 'name', 'title', 'group')->where('is_active', true)->get();
        $permission_groups = formatPermissions($permissions);

        return Inertia::render('User/UserRole', [
            'roles' => $roles,
            'permissions' => $permissions,
            'permission_groups' => $permission_groups,
            'pageLabel' => 'User Roles',
        ]);
    }

    public function createRole()
    {
        $permissions = Permission::where('is_active', true)->get();
        $permission_groups = formatPermissions($permissions);

        return Inertia::render('User/CreateRole', [
            'permission_groups' => $permission_groups,
            'pageLabel' => 'Create Role',
        ]);
    }

    public function storeRole(Request $request)
    {
        // Validation
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:roles,name',
            'permissions' => 'required|array|min:1',
            'permissions.*' => 'exists:permissions,id',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Validate permissions exist before starting transaction
        $permissions = Permission::whereIn('id', $request->permissions)->get();

        if ($permissions->count() == 0) {
            return back()->withErrors(['permissions' => 'Please select at least one permission'])->withInput();
        }

        try {
            DB::beginTransaction();

            $role = Role::create([
                'name' => $request->name,
                'guard_name' => 'web',
            ]);

            $role->syncPermissions($permissions);

            // Clear permission cache after creating role
            app()[PermissionRegistrar::class]->forgetCachedPermissions();

            DB::commit();

            return redirect()->route('user.role')
                ->with('success', 'Role created successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating role: '.$e->getMessage());

            return back()->withErrors(['error' => 'Something went wrong. Please try again.'])->withInput();
        }
    }

    public function editRole($id)
    {
        $role = Role::with('permissions')->findOrFail($id);
        $permissions = Permission::where('is_active', true)->get();
        $permission_groups = formatPermissions($permissions);

        return Inertia::render('User/CreateRole', [
            'role' => $role,
            'permission_groups' => $permission_groups,
            'pageLabel' => 'Edit Role',
        ]);
    }

    public function updateRole(Request $request, $roleId)
    {
        // Validation
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:roles,name,'.$roleId,
            'permissions' => 'required|array|min:1',
            'permissions.*' => 'exists:permissions,id',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Validate permissions exist before starting transaction
        $permissions = Permission::whereIn('id', $request->permissions)->get();

        if ($permissions->count() == 0) {
            return back()->withErrors(['permissions' => 'Please select at least one permission'])->withInput();
        }

        try {
            DB::beginTransaction();

            // Find role by ID
            $role = Role::findOrFail($roleId);
            $role->name = $request->name;
            $role->save();

            // Sync permissions to the role (replace the existing permissions with the new ones)
            $role->syncPermissions($permissions);

            // Clear permission cache after updating role permissions
            app()[PermissionRegistrar::class]->forgetCachedPermissions();

            DB::commit();

            // Redirect back to the user roles page with success message
            return redirect()->route('user.role')
                ->with('success', 'Role and permissions updated successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating role: '.$e->getMessage());

            return back()->withErrors(['error' => 'Something went wrong. Please try again.'])->withInput();
        }
    }

    public function checkUsername(Request $request)
    {
        $request->validate([
            'user_name' => 'required|string|max:255',
            'user_id' => 'nullable|exists:users,id',
        ]);

        $userName = $request->input('user_name');
        $userId = $request->input('user_id');

        // Check for existing username, excluding soft-deleted users
        $query = User::where('user_name', $userName)
            ->whereNull('deleted_at');

        // If updating, exclude current user from check
        if ($userId) {
            $query->where('id', '!=', $userId);
        }

        $exists = $query->exists();

        return response()->json([
            'available' => !$exists,
            'message' => $exists ? 'Username is already taken' : 'Username is available',
        ]);
    }

    public function store(Request $request)
    {
        // Validate the incoming request
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                \Illuminate\Validation\Rule::unique('users', 'email')->whereNull('deleted_at'),
            ],
            'password' => 'required|string|min:4',
            'user_name' => [
                'required',
                'string',
                'max:255',
                \Illuminate\Validation\Rule::unique('users', 'user_name')->whereNull('deleted_at'),
            ],
            'user_role' => 'required|string|exists:roles,name',
        ]);

        // Create a new user
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password), // Hash the password
            'user_name' => $request->user_name,
            'user_role' => $request->user_role,
        ]);

        $user->assignRole($request->user_role);

        // Clear permission cache after assigning role to new user
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        return Redirect::route('users.index');
    }

    public function update(Request $request, $id)
    {
        // Find the user by ID
        $user = User::findOrFail($id);

        // Validate the incoming request
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                \Illuminate\Validation\Rule::unique('users', 'email')->ignore($user->id)->whereNull('deleted_at'),
            ],
            'password' => 'nullable|string|min:4', // Password is optional for update
            'user_name' => [
                'required',
                'string',
                'max:255',
                \Illuminate\Validation\Rule::unique('users', 'user_name')->ignore($user->id)->whereNull('deleted_at'),
            ],
            'user_role' => 'required|string|exists:roles,name',
        ]);

        // Update user details
        $user->name = $request->name;
        $user->email = $request->email;
        $user->user_name = $request->user_name;
        $user->user_role = $request->user_role;

        // Only update the password if it is provided
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->syncRoles($request->user_role);

        // Clear permission cache after updating user role
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $user->save();

        return Redirect::route('users.index');
    }

    public function userDeactivate($id)
    {
        $user = User::findOrFail($id);

        if (Auth::user()->id === $user->id) {
            return response()->json([
                'message' => 'You cannot deactivate your own account.',
            ], 403);
        }

        DB::beginTransaction();
        try {
            // Deactivate user
            $user->is_active = 0;
            $user->save();

            // Invalidate all sessions for this user
            // Method 1: Delete all sessions for this user from sessions table
            DB::table('sessions')->where('user_id', $user->id)->delete();

            // Method 2: If using database sessions, also clear remember tokens
            $user->remember_token = null;
            $user->save();

            DB::commit();

            return response()->json([
                'message' => 'User deactivated successfully and all sessions terminated.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Failed to deactivate user: '.$e->getMessage(),
            ], 500);
        }
    }

    public function deleteRole($id)
    {
        try {
            DB::beginTransaction();

            $role = Role::findOrFail($id);

            // Prevent deletion of super-admin and admin roles
            if ($role->name === 'super-admin' || $role->name === 'admin') {
                DB::rollBack();

                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete system roles (admin or super-admin).',
                ], 403);
            }

            // Check if role is assigned to any users via user_role field
            $usersWithRole = User::where('user_role', $role->name)->count();

            // Check if role is assigned to any users via Spatie's model_has_roles table
            $usersWithSpatieRole = DB::table('model_has_roles')
                ->where('role_id', $role->id)
                ->count();

            if ($usersWithRole > 0 || $usersWithSpatieRole > 0) {
                DB::rollBack();
                $totalUsers = $usersWithRole + $usersWithSpatieRole;

                return response()->json([
                    'success' => false,
                    'message' => "Cannot delete role. This role is currently assigned to {$totalUsers} user(s). Please reassign users to another role before deleting.",
                ], 422);
            }

            // Delete the role (this will also remove related permissions via cascade or sync)
            $role->delete();

            // Clear permission cache after deleting role
            app()[PermissionRegistrar::class]->forgetCachedPermissions();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Role deleted successfully!',
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Role not found.',
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting role: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while deleting the role. Please try again.',
            ], 500);
        }
    }
}
