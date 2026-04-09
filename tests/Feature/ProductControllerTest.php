<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class ProductControllerTest extends TestCase
{
    use RefreshDatabase;

    protected Store $store;
    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
        foreach (['view_products', 'create_product', 'edit_product', 'delete_product'] as $perm) {
            Permission::findOrCreate($perm);
        }

        $this->store = Store::create([
            'name' => 'Product Test Store',
            'address' => '123 Test Lane',
            'contact_number' => '5555555555',
            'sale_prefix' => 'PRD',
            'current_sale_number' => 1,
        ]);

        $this->user = User::factory()->create([
            'store_id' => $this->store->id,
            'user_name' => 'product_user',
            'user_role' => 'admin',
        ]);
        $this->user->givePermissionTo(['view_products', 'create_product', 'edit_product', 'delete_product']);
    }

    public function test_store_creates_product_batch_and_stock(): void
    {
        $payload = [
            'name' => 'Full Product',
            'description' => 'Created via store route',
            'sku' => 'SKU12345',
            'barcode' => 'BC12345',
            'quantity' => 3,
            'cost' => 4.5,
            'price' => 9.5,
            'alert_quantity' => 1,
            'unit' => 'pcs',
            'is_stock_managed' => true,
            'is_active' => true,
            'discount' => 0,
            'product_type' => 'simple',
        ];

        $response = $this->actingAs($this->user, 'web')
            ->post(route('products.store'), $payload);

        $response->assertRedirect(route('products.index'));

        $this->assertDatabaseHas('products', [
            'name' => 'Full Product',
            'sku' => 'SKU12345',
            'barcode' => 'BC12345',
        ]);

        $this->assertDatabaseHas('product_batches', [
            'cost' => 4.5,
            'price' => 9.5,
        ]);

        $this->assertDatabaseHas('product_stocks', [
            'quantity' => 3,
        ]);
    }

    public function test_quick_store_creates_product_and_batch(): void
    {
        $payload = [
            'name' => 'Quick Product',
            'description' => 'Created via quick store',
            'quantity' => 5,
            'cost' => 10,
            'price' => 15,
            'alert_quantity' => 1,
            'unit' => 'pcs',
            'is_stock_managed' => true,
            'is_active' => true,
            'discount' => 0,
            'product_type' => 'simple',
        ];

        $response = $this->actingAs($this->user, 'web')
            ->withSession(['store_id' => $this->store->id])
            ->postJson(route('products.quick.store'), $payload);

        $response->assertStatus(200)->assertJson([
            'success' => true,
            'product' => [
                'name' => 'Quick Product',
                'price' => 15,
            ],
        ]);

        $this->assertDatabaseHas('products', ['name' => 'Quick Product']);
        $this->assertDatabaseHas('product_batches', ['batch_number' => 'DEFAULT']);
        $this->assertDatabaseHas('product_stocks', ['quantity' => 5]);
    }

    public function test_update_product_changes_name_and_redirects(): void
    {
        $product = Product::create([
            'name' => 'Old Name',
            'description' => 'Desc',
            'unit' => 'pcs',
            'quantity' => 1,
            'alert_quantity' => 1,
            'is_stock_managed' => false,
            'is_active' => true,
            'discount' => 0,
            'product_type' => 'simple',
        ]);

        $response = $this->actingAs($this->user, 'web')
            ->post(route('products.update', $product->id), [
                'name' => 'New Name',
                'description' => 'Updated',
                'unit' => 'pcs',
                'alert_quantity' => 2,
                'is_stock_managed' => false,
                'is_active' => true,
            ]);

        $response->assertRedirect(route('products.index'));
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'New Name',
            'description' => 'Updated',
        ]);
    }

    public function test_delete_product_soft_deletes_record(): void
    {
        $product = Product::create([
            'name' => 'Delete Me',
            'description' => 'Desc',
            'unit' => 'pcs',
            'quantity' => 1,
            'alert_quantity' => 1,
            'is_stock_managed' => false,
            'is_active' => true,
            'discount' => 0,
            'product_type' => 'simple',
        ]);

        $response = $this->actingAs($this->user, 'web')
            ->delete(route('products.destroy', $product->id));

        $response->assertStatus(302);
        $this->assertSoftDeleted('products', ['id' => $product->id]);
    }
}
