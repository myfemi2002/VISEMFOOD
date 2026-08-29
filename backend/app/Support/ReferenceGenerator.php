<?php

namespace App\Support;

use App\Models\ReferenceCounter;
use Illuminate\Support\Facades\DB;

class ReferenceGenerator
{
    public function nextOrderNumber(): string
    {
        return $this->next('order', config('visemfood.order_reference_prefix', 'VF'));
    }

    public function nextCateringReference(): string
    {
        return $this->next('catering', config('visemfood.catering_reference_prefix', 'CAT'));
    }

    public function nextContactReference(): string
    {
        return $this->next('contact', config('visemfood.contact_reference_prefix', 'MSG'));
    }

    private function next(string $scope, string $prefix): string
    {
        return DB::transaction(function () use ($scope, $prefix) {
            $year = (int) now()->year;

            $counter = ReferenceCounter::query()
                ->where('scope', $scope)
                ->where('year', $year)
                ->lockForUpdate()
                ->first();

            if ($counter === null) {
                $counter = ReferenceCounter::query()->create([
                    'scope' => $scope,
                    'year' => $year,
                    'current_number' => 0,
                ]);
            }

            $counter->increment('current_number');
            $counter->refresh();

            return sprintf('%s-%d-%06d', $prefix, $year, $counter->current_number);
        });
    }
}
