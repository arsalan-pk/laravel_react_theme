<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_details', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('key'); // e.g., 'phone', 'address', 'profile_picture'
            $table->text('value')->nullable(); // The actual value
            $table->string('group')->default('general'); // e.g., 'personal', 'contact', 'social', 'preferences'
            $table->string('type')->default('string'); // e.g., 'string', 'text', 'json', 'date'
            $table->timestamps();
            
            $table->index(['user_id', 'key']);
            $table->index(['user_id', 'group']);
            $table->unique(['user_id', 'key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_details');
    }
};
