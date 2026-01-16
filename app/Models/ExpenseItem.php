<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExpenseItem extends Model
{
    protected $table = 'expenses_items';

    protected $fillable = [
        'expense_id',
        'description',
        'amount',
        'created_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public $timestamps = false;

    protected $dates = ['created_at'];

    public function expense(): BelongsTo
    {
        return $this->belongsTo(Expense::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
