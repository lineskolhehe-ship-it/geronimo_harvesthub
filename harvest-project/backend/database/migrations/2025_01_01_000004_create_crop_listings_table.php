<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crop_listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farmer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('crop_id')->constrained()->restrictOnDelete();
            $table->foreignId('harvest_record_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('available_quantity', 10, 2);
            $table->string('unit', 20)->default('kg');
            $table->decimal('price_per_unit', 10, 2);
            $table->date('harvest_date')->nullable();
            $table->string('status', 20)->default('available')->index(); // available, sold_out
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crop_listings');
    }
};
