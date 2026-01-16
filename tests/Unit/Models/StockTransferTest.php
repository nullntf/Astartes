<?php

namespace Tests\Unit\Models;

use App\Models\Category;
use App\Models\Product;
use App\Models\StockTransfer;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StockTransferTest extends TestCase
{
    use RefreshDatabase;

    public function test_stock_transfer_can_be_created_with_valid_data(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $storeA = Store::factory()->create(['created_by' => $user->id]);
        $storeB = Store::factory()->create(['created_by' => $user->id]);
        $category = Category::factory()->create(['created_by' => $user->id]);
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'created_by' => $user->id,
        ]);

        $transfer = StockTransfer::create([
            'from_store_id' => $storeA->id,
            'to_store_id' => $storeB->id,
            'product_id' => $product->id,
            'quantity' => 50,
            'notes' => 'Test transfer',
            'created_by' => $user->id,
        ]);

        $this->assertInstanceOf(StockTransfer::class, $transfer);
        $this->assertEquals($storeA->id, $transfer->from_store_id);
        $this->assertEquals($storeB->id, $transfer->to_store_id);
        $this->assertEquals($product->id, $transfer->product_id);
        $this->assertEquals(50, $transfer->quantity);
        $this->assertEquals('Test transfer', $transfer->notes);
    }

    public function test_stock_transfer_belongs_to_from_store(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $storeA = Store::factory()->create(['created_by' => $user->id]);
        $storeB = Store::factory()->create(['created_by' => $user->id]);
        $category = Category::factory()->create(['created_by' => $user->id]);
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'created_by' => $user->id,
        ]);

        $transfer = StockTransfer::create([
            'from_store_id' => $storeA->id,
            'to_store_id' => $storeB->id,
            'product_id' => $product->id,
            'quantity' => 50,
            'created_by' => $user->id,
        ]);

        $this->assertInstanceOf(Store::class, $transfer->fromStore);
        $this->assertEquals($storeA->id, $transfer->fromStore->id);
    }

    public function test_stock_transfer_belongs_to_to_store(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $storeA = Store::factory()->create(['created_by' => $user->id]);
        $storeB = Store::factory()->create(['created_by' => $user->id]);
        $category = Category::factory()->create(['created_by' => $user->id]);
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'created_by' => $user->id,
        ]);

        $transfer = StockTransfer::create([
            'from_store_id' => $storeA->id,
            'to_store_id' => $storeB->id,
            'product_id' => $product->id,
            'quantity' => 50,
            'created_by' => $user->id,
        ]);

        $this->assertInstanceOf(Store::class, $transfer->toStore);
        $this->assertEquals($storeB->id, $transfer->toStore->id);
    }

    public function test_stock_transfer_belongs_to_product(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $storeA = Store::factory()->create(['created_by' => $user->id]);
        $storeB = Store::factory()->create(['created_by' => $user->id]);
        $category = Category::factory()->create(['created_by' => $user->id]);
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'created_by' => $user->id,
        ]);

        $transfer = StockTransfer::create([
            'from_store_id' => $storeA->id,
            'to_store_id' => $storeB->id,
            'product_id' => $product->id,
            'quantity' => 50,
            'created_by' => $user->id,
        ]);

        $this->assertInstanceOf(Product::class, $transfer->product);
        $this->assertEquals($product->id, $transfer->product->id);
    }

    public function test_stock_transfer_belongs_to_created_by_user(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $storeA = Store::factory()->create(['created_by' => $user->id]);
        $storeB = Store::factory()->create(['created_by' => $user->id]);
        $category = Category::factory()->create(['created_by' => $user->id]);
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'created_by' => $user->id,
        ]);

        $transfer = StockTransfer::create([
            'from_store_id' => $storeA->id,
            'to_store_id' => $storeB->id,
            'product_id' => $product->id,
            'quantity' => 50,
            'created_by' => $user->id,
        ]);

        $this->assertInstanceOf(User::class, $transfer->createdBy);
        $this->assertEquals($user->id, $transfer->createdBy->id);
    }
}
