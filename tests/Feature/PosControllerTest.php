<?php

namespace Tests\Feature;

use App\Models\Contact;
use App\Models\Product;
use App\Models\ProductBatch;
use App\Models\ProductStock;
use App\Models\Sale;
use App\Models\Collection;
use App\Models\Store;
use App\Models\Transaction;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class PosControllerTest extends TestCase
{
    use RefreshDatabase;

    protected Store $store;
    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutExceptionHandling();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
        Permission::findOrCreate('view_pos');

        $this->store = Store::create([
            'name' => 'POS Test Store',
            'address' => '123 Test Lane',
            'contact_number' => '5555555555',
            'sale_prefix' => 'POS',
            'current_sale_number' => 10,
        ]);

        $this->user = User::factory()->create([
            'store_id' => $this->store->id,
            'user_name' => 'pos_user',
            'user_role' => 'admin',
        ]);

        $this->user->givePermissionTo('view_pos');
    }

    private function createContact(float $balance = 0): Contact
    {
        return Contact::create([
            'name' => 'POS Buyer',
            'type' => 'customer',
            'balance' => $balance,
        ]);
    }

    private function createProductAndBatch(User $user): ProductBatch
    {
        $product = Product::create([
            'name' => 'POS Item',
            'unit' => 'pcs',
            'discount' => 0,
            'quantity' => 0,
            'alert_quantity' => 1,
            'is_stock_managed' => false,
            'is_active' => true,
            'is_featured' => false,
            'meta_data' => null,
            'created_by' => $user->id,
        ]);

        return ProductBatch::create([
            'product_id' => $product->id,
            'batch_number' => 'POS-BATCH',
            'cost' => 10,
            'price' => 15,
            'discount' => 0,
            'discount_percentage' => 0,
            'is_active' => 1,
            'created_by' => $user->id,
        ]);
    }

    public function test_checkout_account_payment_decrements_contact_balance(): void
    {
        $contact = $this->createContact();
        $batch = $this->createProductAndBatch($this->user);

        $payload = [
            'contact_id' => $contact->id,
            'net_total' => 10,
            'amount_received' => 0,
            'cartItems' => [[
                'id' => $batch->product_id,
                'batch_id' => $batch->id,
                'quantity' => 1,
                'price' => 15,
                'discount' => 0,
                'cost' => 10,
                'flat_discount' => 0,
                'free_quantity' => 0,
                'name' => 'POS Item',
                'is_stock_managed' => 0,
                'product_type' => 'simple',
                'category_name' => 'General',
            ]],
            'charges' => [],
            'payment_method' => 'Account',
            'payments' => [
                ['payment_method' => 'Account', 'amount' => 10],
            ],
        ];

        $response = $this->actingAs($this->user, 'web')
            ->withSession(['store_id' => $this->store->id])
            ->postJson(route('pos.checkout'), $payload);

        // $response->dump();
        $response->assertStatus(201);

        $this->assertSame('-10.00', $contact->refresh()->balance);
    }

    public function test_checkout_refund_cash_creates_cash_log_without_changing_balance(): void
    {
        $contact = $this->createContact();
        $batch = $this->createProductAndBatch($this->user);

        $payload = [
            'contact_id' => $contact->id,
            'net_total' => -10,
            'amount_received' => 0,
            'cartItems' => [[
                'id' => $batch->product_id,
                'batch_id' => $batch->id,
                'quantity' => -1,
                'price' => 10,
                'discount' => 0,
                'cost' => 8,
                'flat_discount' => 0,
                'free_quantity' => 0,
                'name' => 'POS Return Item',
                'is_stock_managed' => 0,
                'product_type' => 'simple',
                'category_name' => 'General',
            ]],
            'charges' => [],
            'payment_method' => 'Cash',
            'return_sale' => true,
            'return_mode' => 'refund',
            'payments' => [],
        ];

        $response = $this->actingAs($this->user, 'web')
            ->withSession(['store_id' => $this->store->id])
            ->postJson(route('pos.checkout'), $payload);

        $response->assertStatus(201);

        $this->assertSame('0.00', $contact->refresh()->balance);
    }

    public function test_return_sale_credit_reduces_contact_balance(): void
    {
        $contact = $this->createContact(-100);
        $batch = $this->createProductAndBatch($this->user);
        $referenceSale = Sale::create([
            'store_id' => $this->store->id,
            'contact_id' => $contact->id,
            'sale_type' => 'sale',
            'sale_date' => now()->toDateString(),
            'total_amount' => 100,
            'discount' => 0,
            'amount_received' => 0,
            'profit_amount' => 0,
            'status' => 'completed',
            'payment_status' => 'completed',
            'created_by' => $this->user->id,
            'old_baqaya' => $contact->balance,
            'current_baqaya' => $contact->balance,
        ]);

        $payload = [
            'contact_id' => $contact->id,
            'net_total' => -30,
            'amount_received' => 0,
            'cartItems' => [[
                'id' => $batch->product_id,
                'batch_id' => $batch->id,
                'quantity' => -1,
                'price' => 30,
                'discount' => 0,
                'cost' => 10,
                'flat_discount' => 0,
                'free_quantity' => 0,
                'name' => 'POS Return Item',
                'is_stock_managed' => 0,
                'product_type' => 'simple',
                'category_name' => 'General',
            ]],
            'charges' => [],
            'payment_method' => 'Credit',
            'return_sale' => true,
            'return_mode' => 'return',
            'return_sale_id' => $referenceSale->id,
            'payments' => [
                ['payment_method' => 'Credit', 'amount' => -30],
            ],
        ];

        $response = $this->actingAs($this->user, 'web')
            ->withSession(['store_id' => $this->store->id])
            ->postJson(route('pos.checkout'), $payload);

        $response->assertStatus(201);

        $this->assertSame('-70.00', $contact->refresh()->balance);
    }

    public function test_edit_sale_recomputes_contact_balance_with_new_payments(): void
    {
        $contact = $this->createContact(-100);
        $batch = $this->createProductAndBatch($this->user);
        $sale = Sale::create([
            'store_id' => $this->store->id,
            'contact_id' => $contact->id,
            'sale_type' => 'sale',
            'sale_date' => now()->toDateString(),
            'total_amount' => 100,
            'discount' => 0,
            'amount_received' => 0,
            'profit_amount' => 0,
            'status' => 'pending',
            'payment_status' => 'pending',
            'created_by' => $this->user->id,
            'old_baqaya' => $contact->balance,
            'current_baqaya' => $contact->balance,
        ]);

        Transaction::create([
            'sales_id' => $sale->id,
            'store_id' => $sale->store_id,
            'contact_id' => $sale->contact_id,
            'transaction_date' => $sale->sale_date,
            'amount' => 100,
            'payment_method' => 'Credit',
            'transaction_type' => 'sale',
        ]);

        $payload = [
            'contact_id' => $contact->id,
            'net_total' => 50,
            'amount_received' => 0,
            'cartItems' => [[
                'id' => $batch->product_id,
                'batch_id' => $batch->id,
                'quantity' => 1,
                'price' => 50,
                'discount' => 0,
                'cost' => 10,
                'flat_discount' => 0,
                'free_quantity' => 0,
                'name' => 'POS Item',
                'is_stock_managed' => 0,
                'product_type' => 'simple',
                'category_name' => 'General',
            ]],
            'charges' => [],
            'payment_method' => 'Credit',
            'payments' => [
                ['payment_method' => 'Credit', 'amount' => 50],
            ],
            'edit_sale' => true,
            'edit_sale_id' => $sale->id,
        ];

        $response = $this->actingAs($this->user, 'web')
            ->withSession(['store_id' => $this->store->id])
            ->postJson(route('pos.checkout'), $payload);

        $response->assertStatus(201);

        $this->assertSame('-50.00', $contact->refresh()->balance);
    }

    public function test_get_products_by_category_filters_products(): void
    {
        $category = Collection::create([
            'collection_type' => 'category',
            'name' => 'POS Category',
        ]);

        $product = Product::create([
            'name' => 'Categorized Item',
            'unit' => 'pcs',
            'discount' => 0,
            'quantity' => 0,
            'alert_quantity' => 1,
            'is_stock_managed' => true,
            'is_active' => true,
            'is_featured' => true,
            'meta_data' => null,
            'created_by' => $this->user->id,
            'category_id' => $category->id,
        ]);

        $batch = ProductBatch::create([
            'product_id' => $product->id,
            'batch_number' => 'CAT-BATCH',
            'cost' => 5,
            'price' => 10,
            'discount' => 0,
            'discount_percentage' => 0,
            'is_active' => 1,
            'is_featured' => 1,
            'created_by' => $this->user->id,
        ]);

        ProductStock::create([
            'store_id' => $this->store->id,
            'product_id' => $product->id,
            'batch_id' => $batch->id,
            'quantity' => 20,
        ]);

        $payload = [
            'category_id' => $category->id,
            'brand_id' => null,
            'tag_id' => null,
            'page' => 1,
            'per_page' => 30,
        ];

        $response = $this->actingAs($this->user, 'web')
            ->withSession(['store_id' => $this->store->id])
            ->postJson('/pos/filter', $payload);

        $response->assertStatus(200);
        $this->assertEquals($product->id, $response->json('data.0.id'));
        $this->assertSame(1, $response->json('total'));
    }
}
