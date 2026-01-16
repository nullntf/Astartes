<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategoryRequest;
use App\Models\Category;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        $categories = Category::with(['createdBy', 'updatedBy'])
            ->withCount('products')
            ->latest()
            ->paginate(15);

        $categories->getCollection()->transform(function ($category) {
            $category->can_be_deleted = $category->canBeDeleted();
            $category->deletion_blockers = $category->getDeletionBlockers();
            return $category;
        });

        return Inertia::render('categories/index', [
            'categories' => $categories,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('categories/create');
    }

    public function store(CategoryRequest $request)
    {
        $validated = $request->validated();
        $validated['created_by'] = auth()->id();

        $category = Category::create($validated);

        return redirect()->route('categories.index')
            ->with('success', 'Categoría creada exitosamente.');
    }

    public function show(Category $category): Response
    {
        $category->load(['products' => function ($query) {
            $query->where('is_active', true)->with('stores');
        }]);

        return Inertia::render('categories/show', [
            'category' => $category,
        ]);
    }

    public function edit(Category $category): Response
    {
        return Inertia::render('categories/edit', [
            'category' => $category,
        ]);
    }

    public function update(CategoryRequest $request, Category $category)
    {
        $validated = $request->validated();
        $validated['updated_by'] = auth()->id();

        $category->update($validated);

        return redirect()->route('categories.index')
            ->with('success', 'Categoría actualizada exitosamente.');
    }

    public function destroy(Category $category)
    {
        if (!$category->canBeDeleted()) {
            return back()->withErrors([
                'error' => 'No se puede eliminar esta categoría: ' . implode(', ', $category->getDeletionBlockers())
            ]);
        }

        $category->delete();

        return redirect()->route('categories.index')
            ->with('success', 'Categoría eliminada exitosamente.');
    }

    public function toggleActive(Category $category)
    {
        $category->update([
            'is_active' => !$category->is_active,
            'updated_by' => auth()->id(),
        ]);

        return back()->with('success', 'Estado de la categoría actualizado.');
    }
}
