<?php

namespace Tests\Feature;

use App\Http\Controllers\PaperBillController;
use App\Models\Contact;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class PaperBillControllerTest extends TestCase
{
    use RefreshDatabase;

    private function createStore(): Store
    {
        return Store::create([
            'name' => 'Paper Bill Store',
            'address' => '125 Ledger Road',
            'contact_number' => '5551234567',
            'sale_prefix' => 'PB',
            'current_sale_number' => 2,
        ]);
    }

    private function createContact(float $balance = 0): Contact
    {
        return Contact::create([
            'name' => 'Paper Bill Contact',
            'type' => 'customer',
            'balance' => $balance,
        ]);
    }

    private function createUser(Store $store): User
    {
        return User::factory()->create([
            'store_id' => $store->id,
            'user_name' => 'paperbill_user',
            'user_role' => 'admin',
        ]);
    }

    public function test_store_reduces_balance_by_credit_outstanding(): void
    {
        $store = $this->createStore();
        $contact = $this->createContact(0);
        $user = $this->createUser($store);

        Auth::login($user);
        $session = app('session.store');
        $session->put('store_id', $store->id);

        $request = Request::create("/paper-bills/{$contact->id}", 'POST', [
            'amount' => 200,
            'amount_received' => 50,
            'payment_method' => 'Bank',
            'note' => 'Paper credit sale',
        ]);
        $request->setLaravelSession($session);

        $response = app(PaperBillController::class)->store($request, $contact->id);

        $this->assertEquals(302, $response->getStatusCode());
        $this->assertSame('-150.00', $contact->refresh()->balance);
        $this->assertDatabaseHas('transactions', [
            'contact_id' => $contact->id,
            'payment_method' => 'Credit',
            'amount' => 150,
        ]);
    }

    public function test_return_bill_increments_balance_and_creates_credit_transaction(): void
    {
        $store = $this->createStore();
        $contact = $this->createContact(-80);
        $user = $this->createUser($store);

        Auth::login($user);
        $session = app('session.store');
        $session->put('store_id', $store->id);

        $request = Request::create("/paper-bills/{$contact->id}/return", 'POST', [
            'amount' => 80,
            'payment_method' => 'Cash',
            'note' => 'Return paper test',
        ]);
        $request->setLaravelSession($session);

        $response = app(PaperBillController::class)->returnBill($request, $contact->id);

        $this->assertEquals(302, $response->getStatusCode());
        $this->assertSame('0.00', $contact->refresh()->balance);
        $this->assertDatabaseHas('transactions', [
            'contact_id' => $contact->id,
            'payment_method' => 'Credit',
            'amount' => 80,
        ]);
    }
}
