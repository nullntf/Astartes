<?php

namespace App\Services;

use App\Models\Product;

class ProductStockService
{
    public function updateProductActiveStatus(Product $product): void
    {
        $totalStock = $product->getTotalStock();

        if ($totalStock === 0 && $product->is_active) {
            $product->update([
                'is_active' => false,
                'updated_by' => auth()->id(),
            ]);
        } elseif ($totalStock > 0 && !$product->is_active) {
            $product->update([
                'is_active' => true,
                'updated_by' => auth()->id(),
            ]);
        }
    }

    public function checkAllProductsStock(): array
    {
        $updated = [
            'deactivated' => [],
            'activated' => [],
        ];

        $products = Product::with('stores')->get();

        foreach ($products as $product) {
            $totalStock = $product->getTotalStock();

            if ($totalStock === 0 && $product->is_active) {
                $product->update(['is_active' => false]);
                $updated['deactivated'][] = $product->name;
            } elseif ($totalStock > 0 && !$product->is_active) {
                $product->update(['is_active' => true]);
                $updated['activated'][] = $product->name;
            }
        }

        return $updated;
    }
}
