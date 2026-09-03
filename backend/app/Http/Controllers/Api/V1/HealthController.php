<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class HealthController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return ApiResponse::success('VISEMFOOD API is healthy.', [
            'status' => 'ok',
            'version' => 'v1',
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}
