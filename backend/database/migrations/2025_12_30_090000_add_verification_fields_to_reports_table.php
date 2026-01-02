<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->unsignedInteger('verification_score')->nullable()->after('ratings_count');
            $table->json('verification_breakdown')->nullable()->after('verification_score');
            $table->string('verification_tier')->nullable()->after('verification_breakdown');
            $table->string('verification_status')->nullable()->after('verification_tier');
            $table->timestamp('verification_started_at')->nullable()->after('verification_status');
            $table->timestamp('verification_completed_at')->nullable()->after('verification_started_at');
        });
    }

    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropColumn([
                'verification_score',
                'verification_breakdown',
                'verification_tier',
                'verification_status',
                'verification_started_at',
                'verification_completed_at',
            ]);
        });
    }
};
