<?php

namespace App\Http\Requests\Api\Admin;

use App\Enums\CategoryStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
}
