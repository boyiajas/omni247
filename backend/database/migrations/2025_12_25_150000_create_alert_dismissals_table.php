<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('alert_dismissals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('report_id')->constrained()->cascadeOnDelete();
            $table->string('section')->nullable();
            $table->timestamp('dismissed_at')->useCurrent();
            $table->timestamps();

            $table->unique(['user_id', 'report_id', 'section']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alert_dismissals');
    }
};
