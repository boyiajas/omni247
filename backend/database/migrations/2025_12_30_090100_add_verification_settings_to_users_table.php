<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('auto_verify_enabled')->default(false)->after('theme');
            $table->string('auto_verify_tier')->default('basic')->after('auto_verify_enabled');
            $table->json('auto_verify_levels')->nullable()->after('auto_verify_tier');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['auto_verify_enabled', 'auto_verify_tier', 'auto_verify_levels']);
        });
    }
};
