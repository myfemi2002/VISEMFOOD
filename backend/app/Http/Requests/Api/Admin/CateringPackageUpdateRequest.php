<?php

namespace App\Http\Requests\Api\Admin;

use App\Enums\CateringPackageStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CateringPackageUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('catering_packages.update') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $packageId = $this->route('cateringPackage')?->id;

        return [
            'name' => ['required', 'string', 'min:2', 'max:150'],
            'slug' => ['nullable', 'string', 'max:180', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('catering_packages', 'slug')->ignore($packageId)],
            'short_description' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:10000'],
            'starting_price' => ['required', 'numeric', 'min:0'],
            'minimum_guests' => ['required', 'integer', 'min:1', 'max:5000'],
            'maximum_guests' => ['nullable', 'integer', 'gte:minimum_guests', 'max:5000'],
            'image_media_id' => ['nullable', 'integer', 'exists:media_assets,id'],
            'inclusions' => ['nullable', 'array', 'max:20'],
            'inclusions.*' => ['required', 'string', 'max:255'],
            'featured' => ['sometimes', 'boolean'],
            'status' => ['required', Rule::in(CateringPackageStatus::values())],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:100000'],
        ];
    }
}