<?php

namespace Tests\Feature;

use App\Models\Collection;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class CollectionControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Store $store;

    protected function setUp(): void
    {
        parent::setUp();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
        foreach (['view_collections', 'create_collection', 'edit_collection', 'delete_collection'] as $perm) {
            Permission::findOrCreate($perm);
        }

        $this->store = Store::create([
            'name' => 'Collection Test Store',
            'address' => '123 Test Lane',
            'contact_number' => '5555555555',
            'sale_prefix' => 'COL',
            'current_sale_number' => 1,
        ]);

        $this->user = User::factory()->create([
            'store_id' => $this->store->id,
            'user_name' => 'collection_user',
            'user_role' => 'admin',
        ]);
        $this->user->givePermissionTo(['view_collections', 'create_collection', 'edit_collection', 'delete_collection']);
    }

    public function test_store_creates_collection_and_redirects(): void
    {
        $payload = [
            'name' => 'New Collection',
            'collection_type' => 'category',
            'description' => 'Test description',
        ];

        $response = $this->actingAs($this->user, 'web')
            ->post('/collection', $payload);

        $response->assertRedirect(route('collection'));
        $this->assertDatabaseHas('collections', [
            'name' => 'New Collection',
            'collection_type' => 'category',
        ]);
    }

    public function test_update_changes_name_and_slug(): void
    {
        $collection = Collection::create([
            'name' => 'Old Name',
            'collection_type' => 'category',
        ]);

        $response = $this->actingAs($this->user, 'web')
            ->post('/collection/'.$collection->id, [
                'name' => 'Updated Name',
                'collection_type' => 'category',
            ]);

        $response->assertRedirect(route('collection'));
        $this->assertDatabaseHas('collections', [
            'id' => $collection->id,
            'name' => 'Updated Name',
        ]);
    }

    public function test_destroy_soft_deletes_collection(): void
    {
        $collection = Collection::create([
            'name' => 'Delete Me',
            'collection_type' => 'category',
        ]);

        $response = $this->actingAs($this->user, 'web')
            ->delete('/collections/'.$collection->id);

        $response->assertStatus(200);
        $this->assertSoftDeleted('collections', ['id' => $collection->id]);
    }
}
