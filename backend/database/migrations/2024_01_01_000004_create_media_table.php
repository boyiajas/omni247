<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['image', 'video', 'audio'])->default('image');
            $table->string('url');
            $table->string('thumbnail_url')->nullable();
            $table->string('filename');
            $table->string('mime_type');
            $table->integer('size')->comment('Size in bytes');
            $table->integer('duration')->nullable()->comment('Duration in seconds for video/audio');
            $table->integer('width')->nullable();
            $table->integer('height')->nullable();
            $table->json('metadata')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_deepfake_checked')->default(false);
            $table->decimal('deepfake_score', 5, 4)->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();
            
            $table->index('report_id');
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};
