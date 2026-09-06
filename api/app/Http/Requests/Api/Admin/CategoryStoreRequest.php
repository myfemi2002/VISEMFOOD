<?php

namespace App\Http\Requests\Api\Admin;

use App\Enums\CategoryStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class CategoryStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('categories.create') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:120'],
            'slug' => ['nullable', 'string', 'max:150', 'unique:categories,slug'],
            'description' => ['nullable', 'string', 'max:5000'],
            'image_media_id' => ['nullable', 'integer', 'exists:media_assets,id'],
            'status' => ['required', Rule::in(CategoryStatus::values())],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $name = trim((string) $this->input('name', ''));
        $slug = trim((string) $this->input('slug', ''));

        $this->merge([
            'name' => $name,
            'slug' => $slug !== '' ? Str::slug($slug) : ($name !== '' ? Str::slug($name) : null),
            'description' => $this->normalizeNullableString('description'),
            'image_media_id' => $this->normalizeNullableInteger('image_media_id'),
            'status' => strtolower(trim((string) $this->input('status', CategoryStatus::Active->value))),
            'sort_order' => $this->normalizeNullableInteger('sort_order'),
        ]);
    }

    private function normalizeNullableString(string $key): ?string
    {
        $value = $this->input($key);

        if (! is_string($value)) {
            return null;
        }

        $normalized = trim($value);

        return $normalized !== '' ? $normalized : null;
    }

    private function normalizeNullableInteger(string $key): int|string|null
    {
        $value = $this->input($key);

        if ($value === null || $value === '') {
            return null;
        }

        return $value;
    }
}
