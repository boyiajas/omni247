<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('last_known_country')->nullable()->after('last_login_ip');
            $table->string('last_known_city')->nullable()->after('last_known_country');
            $table->decimal('last_known_lat', 10, 7)->nullable()->after('last_known_city');
            $table->decimal('last_known_lng', 10, 7)->nullable()->after('last_known_lat');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'last_known_country',
                'last_known_city',
                'last_known_lat',
                'last_known_lng',
            ]);
        });
    }
};
