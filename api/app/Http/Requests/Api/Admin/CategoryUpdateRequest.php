<?php

namespace App\Http\Requests\Api\Admin;

use App\Enums\CategoryStatus;
use App\Models\Category;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class CategoryUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('categories.update') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var Category|null $category */
        $category = $this->route('category');

        return [
            'name' => ['required', 'string', 'min:2', 'max:120'],
            'slug' => ['nullable', 'string', 'max:150', Rule::unique('categories', 'slug')->ignore($category?->id)],
            'description' => ['nullable', 'string', 'max:5000'],
            'image_media_id' => ['nullable', 'integer', 'exists:media_assets,id'],
            'status' => ['required', Rule::in(CategoryStatus::values())],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $slug = $this->input('slug');

        $this->merge([
            'name' => trim((string) $this->input('name', '')),
            'slug' => is_string($slug) && trim($slug) !== '' ? Str::slug($slug) : null,
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
