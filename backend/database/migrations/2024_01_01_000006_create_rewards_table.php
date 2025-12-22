<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rewards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('report_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('type', ['report_created', 'report_verified', 'helpful_rating', 'achievement', 'referral'])->default('report_created');
            $table->integer('points');
            $table->string('reason');
            $table->text('metadata')->nullable();
            $table->timestamps();
            
            $table->index('user_id');
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rewards');
    }
};
