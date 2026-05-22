<?php

use App\Models\Team;
use App\Models\User;
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
        Schema::create('team_invites', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('email');
            $table->foreignIdFor(Team::class, 'team_id')->cascadeOnDelete();
            $table->foreignIdFor(User::class, 'created_by_id')->cascadeOnDelete();
            $table->dateTime('accepted_at')->nullable();
            $table->dateTime('rejected_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('team_invites');
    }
};
