<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('harvest_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farmer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('crop_id')->constrained()->restrictOnDelete();
            $table->decimal('expected_quantity', 10, 2);
            $table->decimal('actual_quantity', 10, 2)->nullable();
            $table->string('unit', 20)->default('kg');
            $table->date('harvest_date');
            $table->string('status', 20)->default('planned')->index(); // planned, harvested, listed
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('harvest_records');
    }
};
