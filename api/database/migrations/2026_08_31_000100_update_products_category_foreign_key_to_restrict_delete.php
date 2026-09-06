<?php

use App\Enums\ProductAvailabilityStatus;
use App\Enums\ProductType;
use App\Enums\PublicationStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * @var list<string>
     */
    private array $productColumns = [
        'id',
        'category_id',
        'product_type',
        'name',
        'slug',
        'short_description',
        'description',
        'base_price',
        'compare_price',
        'currency_code',
        'serving_size',
        'status',
        'availability_status',
        'featured',
        'available_for_order',
        'preparation_time_minutes',
        'sort_order',
        'ordering_notes',
        'created_at',
        'updated_at',
    ];

    public function up(): void
    {
        $this->updateForeignKey('restrict');
    }

    public function down(): void
    {
        $this->updateForeignKey('cascade');
    }

    private function updateForeignKey(string $onDelete): void
    {
        if (! Schema::hasTable('products')) {
            return;
        }

        $driver = DB::getDriverName();

        if ($driver === 'sqlite') {
            $this->rebuildSqliteProductsTable($onDelete);

            return;
        }

        Schema::table('products', function (Blueprint $table): void {
            $table->dropForeign(['category_id']);
        });

        Schema::table('products', function (Blueprint $table) use ($onDelete): void {
            $foreign = $table->foreign('category_id')
                ->references('id')
                ->on('categories')
                ->cascadeOnUpdate();

            if ($onDelete === 'cascade') {
                $foreign->cascadeOnDelete();

                return;
            }

            $foreign->restrictOnDelete();
        });
    }

    private function rebuildSqliteProductsTable(string $onDelete): void
    {
        Schema::dropIfExists('products__category_fk_tmp');

        DB::statement('PRAGMA foreign_keys = OFF');

        Schema::create('products__category_fk_tmp', function (Blueprint $table) use ($onDelete): void {
            $table->id();

            $foreign = $table->foreignId('category_id')->index();
            if ($onDelete === 'cascade') {
                $foreign->constrained()->cascadeOnDelete();
            } else {
                $foreign->constrained()->restrictOnDelete();
            }

            $table->string('product_type', 30)->default(ProductType::MenuItem->value)->index();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('short_description', 255)->nullable();
            $table->longText('description')->nullable();
            $table->decimal('base_price', 12, 2)->default(0);
            $table->decimal('compare_price', 12, 2)->nullable();
            $table->string('currency_code', 10)->default(config('visemfood.default_currency_code', 'USD'));
            $table->string('serving_size')->nullable();
            $table->string('status', 20)->default(PublicationStatus::Published->value)->index();
            $table->string('availability_status', 20)->default(ProductAvailabilityStatus::Available->value)->index();
            $table->boolean('featured')->default(false)->index();
            $table->boolean('available_for_order')->default(true)->index();
            $table->unsignedInteger('preparation_time_minutes')->nullable();
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->text('ordering_notes')->nullable();
            $table->timestamps();
        });

        DB::table('products__category_fk_tmp')->insertUsing(
            $this->productColumns,
            DB::table('products')->select($this->productColumns),
        );

        Schema::drop('products');
        Schema::rename('products__category_fk_tmp', 'products');

        DB::statement('PRAGMA foreign_keys = ON');
    }
};
