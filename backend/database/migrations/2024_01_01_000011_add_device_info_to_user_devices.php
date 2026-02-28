<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('user_devices')) {
            return;
        }

        Schema::table('user_devices', function (Blueprint $table) {
            if (! Schema::hasColumn('user_devices', 'device_model')) {
                $table->string('device_model')->nullable()->after('device_name');
            }

            if (! Schema::hasColumn('user_devices', 'imei')) {
                $table->string('imei')->nullable()->after('device_model');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('user_devices')) {
            return;
        }

        Schema::table('user_devices', function (Blueprint $table) {
            if (Schema::hasColumn('user_devices', 'device_model')) {
                $table->dropColumn('device_model');
            }

            if (Schema::hasColumn('user_devices', 'imei')) {
                $table->dropColumn('imei');
            }
        });
    }
};
