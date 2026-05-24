<?php

use App\Models\Cuisine;
use App\Models\Reservation;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('restaurants', function (Blueprint $table) {
            $table->string('address')->nullable()->change();
            $table->string('google_maps_embed')->nullable();
            $table->enum('reservation', Reservation::cases())->nullable();
            $table->boolean('parking_available')->default(false);
            $table->boolean('dog_friendly')->default(false);
            $table->renameColumn('menuUrl', 'menu_url');
            $table->string('menu_url')->nullable()->change();
        });

        DB::statement('ALTER TABLE RESTAURANTS ALTER COLUMN cuisine DROP NOT NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('restaurants', function (Blueprint $table) {
            //
        });
    }
};
