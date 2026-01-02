<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->decimal('submitter_latitude', 10, 8)->nullable()->after('longitude');
            $table->decimal('submitter_longitude', 11, 8)->nullable()->after('submitter_latitude');
            $table->decimal('submitter_accuracy', 8, 2)->nullable()->after('submitter_longitude');
            $table->timestamp('submitter_location_recorded_at')->nullable()->after('submitter_accuracy');

            $table->index(['submitter_latitude', 'submitter_longitude'], 'reports_submitter_coords_index');
        });
    }

    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropIndex('reports_submitter_coords_index');
            $table->dropColumn([
                'submitter_latitude',
                'submitter_longitude',
                'submitter_accuracy',
                'submitter_location_recorded_at',
            ]);
        });
    }
};
