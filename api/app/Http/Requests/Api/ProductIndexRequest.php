<?php

namespace App\Http\Requests\Api;

use App\Enums\ProductType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class ProductIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'category' => ['nullable', 'string', 'max:120'],
            'search' => ['nullable', 'string', 'max:160'],
            'featured' => ['nullable', 'boolean'],
            'available_only' => ['nullable', 'boolean'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:48'],
            'product_type' => [
                'nullable',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    foreach ($this->productTypes() as $productType) {
                        if (! in_array($productType, ProductType::values(), true)) {
                            $fail('The selected product type filter is invalid.');

                            return;
                        }
                    }
                },
            ],
        ];
    }

    protected function prepareForValidation(): void
    {
        $productType = $this->input('product_type');

        if (! is_array($productType)) {
            return;
        }

        $this->merge([
            'product_type' => implode(',', array_map(
                static fn (mixed $value): string => trim((string) $value),
                $productType,
            )),
        ]);
    }

    /**
     * @return list<string>
     */
    public function productTypes(): array
    {
        $rawValue = $this->input('product_type');
        $values = is_array($rawValue)
            ? $rawValue
            : preg_split('/\s*,\s*/', (string) $rawValue, -1, PREG_SPLIT_NO_EMPTY);

        if (! is_array($values)) {
            return [];
        }

        return array_values(array_unique(array_filter(array_map(
            static fn (mixed $value): string => Str::of((string) $value)->trim()->lower()->value(),
            $values,
        ))));
    }
}
