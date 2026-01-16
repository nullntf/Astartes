<?php

namespace Tests\Feature\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StockTransferControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Store $storeA;
    private Store $storeB;
    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create(['role' => 'admin']);
        $this->storeA = Store::factory()->create(['name' => 'Store A', 'created_by' => $this->user->id]);
        $this->storeB = Store::factory()->create(['name' => 'Store B', 'created_by' => $this->user->id]);
        
        $category = Category::factory()->create(['created_by' => $this->user->id]);
        $this->product = Product::factory()->create([
            'category_id' => $category->id,
            'created_by' => $this->user->id,
        ]);

        $this->storeA->products()->attach($this->product->id, [
            'stock' => 100,
            'min_stock' => 10,
            'created_by' => $this->user->id,
        ]);
    }

    public function test_guest_cannot_access_stock_transfers(): void
    {
        $response = $this->get('/stock-transfers');
        $response->assertRedirect('/login');
    }

    public function test_authenticated_user_can_view_stock_transfers_index(): void
    {
        $response = $this->actingAs($this->user)->get('/stock-transfers');
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('stock-transfers/index'));
    }

    public function test_authenticated_user_can_view_create_transfer_page(): void
    {
        $response = $this->actingAs($this->user)->get('/stock-transfers/create');
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('stock-transfers/create'));
    }

    public function test_authenticated_user_can_create_stock_transfer(): void
    {
        $response = $this->actingAs($this->user)->post('/stock-transfers', [
            'from_store_id' => $this->storeA->id,
            'to_store_id' => $this->storeB->id,
            'product_id' => $this->product->id,
            'quantity' => 20,
            'notes' => 'Test transfer',
        ]);

        $response->assertRedirect('/stock-transfers');
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('stock_transfers', [
            'from_store_id' => $this->storeA->id,
            'to_store_id' => $this->storeB->id,
            'product_id' => $this->product->id,
            'quantity' => 20,
            'created_by' => $this->user->id,
        ]);

        $this->storeA->refresh();
        $stockA = $this->storeA->products()->where('product_id', $this->product->id)->first()->pivot->stock;
        $this->assertEquals(80, $stockA);

        $this->storeB->refresh();
        $stockB = $this->storeB->products()->where('product_id', $this->product->id)->first()->pivot->stock;
        $this->assertEquals(20, $stockB);
    }

    public function test_transfer_requires_valid_data(): void
    {
        $response = $this->actingAs($this->user)->post('/stock-transfers', [
            'from_store_id' => '',
            'to_store_id' => '',
            'product_id' => '',
            'quantity' => '',
        ]);

        $response->assertSessionHasErrors(['from_store_id', 'to_store_id', 'product_id', 'quantity']);
    }

    public function test_cannot_transfer_to_same_store(): void
    {
        $response = $this->actingAs($this->user)->post('/stock-transfers', [
            'from_store_id' => $this->storeA->id,
            'to_store_id' => $this->storeA->id,
            'product_id' => $this->product->id,
            'quantity' => 20,
        ]);

        $response->assertSessionHasErrors(['to_store_id']);
    }

    public function test_cannot_transfer_more_than_available_stock(): void
    {
        $response = $this->actingAs($this->user)->post('/stock-transfers', [
            'from_store_id' => $this->storeA->id,
            'to_store_id' => $this->storeB->id,
            'product_id' => $this->product->id,
            'quantity' => 150,
        ]);

        $response->assertSessionHasErrors(['quantity']);
    }

    public function test_cannot_transfer_product_not_in_origin_store(): void
    {
        $response = $this->actingAs($this->user)->post('/stock-transfers', [
            'from_store_id' => $this->storeB->id,
            'to_store_id' => $this->storeA->id,
            'product_id' => $this->product->id,
            'quantity' => 10,
        ]);

        $response->assertSessionHasErrors(['from_store_id']);
    }

    public function test_transfer_creates_product_relation_if_not_exists_in_destination(): void
    {
        $productInStoreB = $this->storeB->products()->where('product_id', $this->product->id)->first();
        $this->assertNull($productInStoreB);

        $response = $this->actingAs($this->user)->post('/stock-transfers', [
            'from_store_id' => $this->storeA->id,
            'to_store_id' => $this->storeB->id,
            'product_id' => $this->product->id,
            'quantity' => 30,
            'notes' => null,
        ]);

        $response->assertRedirect('/stock-transfers');
        $response->assertSessionHas('success');

        $productInStoreB = $this->storeB->products()->where('product_id', $this->product->id)->first();
        $this->assertNotNull($productInStoreB);
        $this->assertEquals(30, $productInStoreB->pivot->stock);
    }

    public function test_quantity_must_be_positive(): void
    {
        $response = $this->actingAs($this->user)->post('/stock-transfers', [
            'from_store_id' => $this->storeA->id,
            'to_store_id' => $this->storeB->id,
            'product_id' => $this->product->id,
            'quantity' => -10,
        ]);

        $response->assertSessionHasErrors(['quantity']);
    }
}
