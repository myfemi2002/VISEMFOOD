<?php

namespace App\Http\Requests\Api\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MediaUploadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('media.manage') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'max:'.config('visemfood.max_upload_size_kb', 8192)],
            'spec' => ['required', Rule::in(array_keys(config('visemfood-media.specs', [])))],
            'alt_text' => ['nullable', 'string', 'max:255'],
        ];
    }
}
