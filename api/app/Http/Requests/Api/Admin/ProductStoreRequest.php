<?php

namespace App\Http\Requests\Api\Admin;

use App\Enums\ProductAvailabilityStatus;
use App\Enums\ProductType;
use App\Enums\PublicationStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;
use Illuminate\Support\Str;

class ProductStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('products.create') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'product_type' => ['required', Rule::in(ProductType::values())],
            'name' => ['required', 'string', 'min:2', 'max:150'],
            'slug' => ['nullable', 'string', 'max:180', 'unique:products,slug'],
            'short_description' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:10000'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'compare_price' => ['nullable', 'numeric', 'min:0'],
            'currency_code' => ['nullable', 'string', 'max:10'],
            'serving_size' => ['nullable', 'string', 'max:120'],
            'status' => ['required', Rule::in(PublicationStatus::values())],
            'availability_status' => ['required', Rule::in(ProductAvailabilityStatus::values())],
            'featured' => ['sometimes', 'boolean'],
            'available_for_order' => ['sometimes', 'boolean'],
            'preparation_time_minutes' => ['nullable', 'integer', 'min:0', 'max:1440'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'ordering_notes' => ['nullable', 'string', 'max:10000'],
            'media_ids' => ['nullable', 'array'],
            'media_ids.*' => ['integer', 'exists:media_assets,id'],
            'primary_media_id' => ['nullable', 'integer', 'exists:media_assets,id'],
            'variants' => ['nullable', 'array'],
            'variants.*.name' => ['required_with:variants', 'string', 'max:150'],
            'variants.*.sku' => ['nullable', 'string', 'max:120'],
            'variants.*.portion_label' => ['nullable', 'string', 'max:120'],
            'variants.*.description' => ['nullable', 'string', 'max:2000'],
            'variants.*.price' => ['required_with:variants', 'numeric', 'min:0'],
            'variants.*.compare_price' => ['nullable', 'numeric', 'min:0'],
            'variants.*.availability_status' => ['nullable', Rule::in(ProductAvailabilityStatus::values())],
            'variants.*.is_default' => ['nullable', 'boolean'],
            'variants.*.sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $name = trim((string) $this->input('name', ''));
        $slug = trim((string) $this->input('slug', ''));
        $variants = collect($this->input('variants', []))
            ->map(function ($variant, int $index) {
                $variant = is_array($variant) ? $variant : [];

                return [
                    'name' => trim((string) ($variant['name'] ?? '')),
                    'sku' => $this->nullableString($variant['sku'] ?? null),
                    'portion_label' => $this->nullableString($variant['portion_label'] ?? null),
                    'description' => $this->nullableString($variant['description'] ?? null),
                    'price' => $this->nullableNumber($variant['price'] ?? null),
                    'compare_price' => $this->nullableNumber($variant['compare_price'] ?? null),
                    'availability_status' => $this->normalizeStatus($variant['availability_status'] ?? null),
                    'is_default' => filter_var($variant['is_default'] ?? false, FILTER_VALIDATE_BOOL),
                    'sort_order' => $this->nullableInteger($variant['sort_order'] ?? $index),
                ];
            })
            ->values()
            ->all();

        $this->merge([
            'category_id' => $this->nullableInteger($this->input('category_id')),
            'product_type' => $this->normalizeStatus($this->input('product_type')),
            'name' => $name,
            'slug' => $slug !== '' ? Str::slug($slug) : Str::slug($name),
            'short_description' => $this->nullableString($this->input('short_description')),
            'description' => $this->nullableString($this->input('description')),
            'base_price' => $this->nullableNumber($this->input('base_price')),
            'compare_price' => $this->nullableNumber($this->input('compare_price')),
            'currency_code' => config('visemfood.default_currency_code', 'USD'),
            'serving_size' => $this->nullableString($this->input('serving_size')),
            'status' => $this->normalizeStatus($this->input('status')),
            'availability_status' => $this->normalizeStatus($this->input('availability_status')),
            'featured' => $this->boolean('featured'),
            'available_for_order' => $this->boolean('available_for_order', true),
            'preparation_time_minutes' => $this->nullableInteger($this->input('preparation_time_minutes')),
            'sort_order' => $this->nullableInteger($this->input('sort_order')) ?? 0,
            'ordering_notes' => $this->nullableString($this->input('ordering_notes')),
            'media_ids' => collect($this->input('media_ids', []))
                ->map(fn ($value) => $this->nullableInteger($value))
                ->filter(fn ($value) => $value !== null)
                ->values()
                ->all(),
            'primary_media_id' => $this->nullableInteger($this->input('primary_media_id')),
            'variants' => $variants,
        ]);
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $basePrice = $this->nullableNumber($this->input('base_price'));
            $comparePrice = $this->nullableNumber($this->input('compare_price'));

            if ($basePrice !== null && $comparePrice !== null && $comparePrice > $basePrice) {
                $validator->errors()->add('compare_price', 'Sale price cannot exceed the base price.');
            }

            foreach ($this->input('variants', []) as $index => $variant) {
                $price = $this->nullableNumber($variant['price'] ?? null);
                $salePrice = $this->nullableNumber($variant['compare_price'] ?? null);

                if ($price !== null && $salePrice !== null && $salePrice > $price) {
                    $validator->errors()->add("variants.$index.compare_price", 'Variant sale price cannot exceed the variant price.');
                }
            }
        });
    }

    private function nullableString(mixed $value): ?string
    {
        $normalized = trim((string) ($value ?? ''));

        return $normalized === '' ? null : $normalized;
    }

    private function normalizeStatus(mixed $value): ?string
    {
        $normalized = trim(strtolower((string) ($value ?? '')));

        return $normalized === '' ? null : $normalized;
    }

    private function nullableInteger(mixed $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        return (int) $value;
    }

    private function nullableNumber(mixed $value): int|float|null
    {
        if ($value === null || $value === '') {
            return null;
        }

        return is_numeric($value) ? $value + 0 : null;
    }
}
