<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'username')) {
                $table->string('username', 50)->nullable()->after('id');
            }

            if (!Schema::hasColumn('users', 'full_name')) {
                $table->string('full_name', 100)->nullable()->after('name');
            }
        });

        $this->backfillUsers();

        if (!$this->indexExists('users', 'users_username_unique')) {
            Schema::table('users', function (Blueprint $table) {
                $table->unique('username');
            });
        }
    }

    public function down(): void
    {
        if ($this->indexExists('users', 'users_username_unique')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropUnique('users_username_unique');
            });
        }

        Schema::table('users', function (Blueprint $table) {
            $columns = [];

            if (Schema::hasColumn('users', 'username')) {
                $columns[] = 'username';
            }

            if (Schema::hasColumn('users', 'full_name')) {
                $columns[] = 'full_name';
            }

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }

    private function backfillUsers(): void
    {
        $usedUsernames = [];

        foreach (DB::table('users')->orderBy('id')->get(['id', 'username', 'full_name', 'name', 'employee_code', 'email']) as $user) {
            $baseUsername = $this->normalizeUsername(
                (string) ($user->username
                    ?: $user->employee_code
                    ?: Str::before((string) $user->email, '@')
                    ?: $user->name
                    ?: 'user-' . $user->id)
            );

            $username = $this->makeUniqueUsername($baseUsername, $usedUsernames);
            $fullName = trim((string) ($user->full_name ?: $user->name ?: $user->employee_code ?: $username));

            DB::table('users')
                ->where('id', $user->id)
                ->update([
                    'username' => $username,
                    'full_name' => $fullName,
                ]);

            $usedUsernames[] = strtolower($username);
        }
    }

    private function normalizeUsername(string $value): string
    {
        $normalized = preg_replace('/[^a-zA-Z0-9._-]/', '', Str::lower(trim($value)));

        return $normalized !== '' ? Str::limit($normalized, 50, '') : 'user';
    }

    private function makeUniqueUsername(string $baseUsername, array $usedUsernames): string
    {
        $candidate = $baseUsername;
        $suffix = 1;

        while (in_array(strtolower($candidate), $usedUsernames, true)) {
            $suffixText = (string) $suffix;
            $trimmedBase = Str::limit($baseUsername, 50 - strlen($suffixText) - 1, '');
            $candidate = $trimmedBase . '-' . $suffixText;
            $suffix++;
        }

        return $candidate;
    }

    private function indexExists(string $table, string $index): bool
    {
        if (DB::getDriverName() === 'sqlite') {
            foreach (DB::select("PRAGMA index_list('{$table}')") as $existingIndex) {
                if (($existingIndex->name ?? null) === $index) {
                    return true;
                }
            }

            return false;
        }

        if (DB::getDriverName() === 'mysql') {
            return DB::select("SHOW INDEX FROM `{$table}` WHERE Key_name = ?", [$index]) !== [];
        }

        return false;
    }
};