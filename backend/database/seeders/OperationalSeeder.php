<?php

namespace Database\Seeders;

use App\Enums\CateringInquiryStatus;
use App\Enums\ContactMessageStatus;
use App\Enums\DeliveryType;
use App\Enums\OrderStatus;
use App\Models\CateringInquiry;
use App\Models\ContactMessage;
use App\Models\Order;
use App\Models\Product;
use App\Models\ReferenceCounter;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class OperationalSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::query()->where('email', env('VISEMFOOD_ADMIN_EMAIL', 'admin@visemfood.test'))->first();

        $this->seedOrders($admin);
        $this->seedCatering($admin);
        $this->seedContactMessages($admin);
        $this->seedReferenceCounters();
    }

    private function seedOrders(?User $admin): void
    {
        $tray = Product::query()->where('slug', 'large-jollof-party-tray')->first();
        $cooler = Product::query()->where('slug', 'executive-cooler-pack')->first();
        $jollof = Product::query()->where('slug', 'signature-jollof-rice')->first();

        $orders = [
            [
                'order_number' => 'VF-2026-000001',
                'customer_name' => 'The Oak House',
                'customer_email' => 'events@theoakhouse.test',
                'customer_phone' => '+2348000001010',
                'delivery_type' => DeliveryType::Delivery,
                'delivery_address' => 'Victoria Island, Lagos',
                'preferred_fulfillment_at' => '2026-08-25 12:00:00',
                'estimated_total' => 255000,
                'status' => OrderStatus::Preparing,
                'ordered_at' => '2026-08-22 10:00:00',
                'confirmed_at' => '2026-08-22 12:00:00',
                'items' => [
                    ['product' => $tray, 'name' => 'Large Jollof Party Tray', 'variant' => 'Serves 12 - 18', 'qty' => 3, 'price' => 85000],
                ],
            ],
            [
                'order_number' => 'VF-2026-000002',
                'customer_name' => 'Bisi & Co',
                'customer_email' => 'hello@bisiandco.test',
                'customer_phone' => '+2348000002020',
                'delivery_type' => DeliveryType::Pickup,
                'delivery_address' => null,
                'preferred_fulfillment_at' => '2026-08-26 15:00:00',
                'estimated_total' => 240000,
                'status' => OrderStatus::WhatsAppPending,
                'ordered_at' => '2026-08-25 09:00:00',
                'whatsapp_started_at' => '2026-08-25 09:05:00',
                'items' => [
                    ['product' => $cooler, 'name' => 'Executive Cooler Pack', 'variant' => 'Serves 18 - 25', 'qty' => 2, 'price' => 120000],
                ],
            ],
            [
                'order_number' => 'VF-2026-000003',
                'customer_name' => 'Nestoil',
                'customer_email' => 'hospitality@nestoil.test',
                'customer_phone' => '+2348000003030',
                'delivery_type' => DeliveryType::Delivery,
                'delivery_address' => 'Ikoyi, Lagos',
                'preferred_fulfillment_at' => '2026-08-27 11:00:00',
                'estimated_total' => 340000,
                'final_total' => 340000,
                'status' => OrderStatus::Completed,
                'ordered_at' => '2026-08-24 08:30:00',
                'confirmed_at' => '2026-08-24 10:00:00',
                'completed_at' => '2026-08-27 16:30:00',
                'items' => [
                    ['product' => $tray, 'name' => 'Large Jollof Party Tray', 'variant' => 'Serves 12 - 18', 'qty' => 4, 'price' => 85000],
                ],
            ],
            [
                'order_number' => 'VF-2026-000004',
                'customer_name' => 'John Doe',
                'customer_email' => 'john@example.test',
                'customer_phone' => '+2348000004040',
                'delivery_type' => DeliveryType::Delivery,
                'delivery_address' => 'Lekki, Lagos',
                'preferred_fulfillment_at' => '2026-08-30 13:00:00',
                'estimated_total' => 17000,
                'status' => OrderStatus::Negotiating,
                'ordered_at' => '2026-08-27 09:15:00',
                'whatsapp_started_at' => '2026-08-27 09:20:00',
                'items' => [
                    ['product' => $jollof, 'name' => 'Signature Jollof Rice', 'variant' => 'Single bowl', 'qty' => 2, 'price' => 8500],
                ],
            ],
        ];

        foreach ($orders as $orderData) {
            $subtotal = collect($orderData['items'])->sum(fn (array $item): int => $item['qty'] * $item['price']);

            $order = Order::query()->updateOrCreate(
                ['order_number' => $orderData['order_number']],
                [
                    'customer_name' => $orderData['customer_name'],
                    'customer_email' => $orderData['customer_email'],
                    'customer_phone' => $orderData['customer_phone'],
                    'delivery_type' => $orderData['delivery_type'],
                    'delivery_address' => $orderData['delivery_address'],
                    'preferred_fulfillment_at' => $orderData['preferred_fulfillment_at'],
                    'currency_code' => 'NGN',
                    'subtotal' => $subtotal,
                    'delivery_fee' => 0,
                    'discount_amount' => 0,
                    'estimated_total' => $orderData['estimated_total'],
                    'final_total' => $orderData['final_total'] ?? null,
                    'status' => $orderData['status'],
                    'whatsapp_started_at' => $orderData['whatsapp_started_at'] ?? null,
                    'ordered_at' => $orderData['ordered_at'],
                    'confirmed_at' => $orderData['confirmed_at'] ?? null,
                    'completed_at' => $orderData['completed_at'] ?? null,
                    'handled_by_user_id' => $admin?->id,
                ],
            );

            $order->items()->delete();

            foreach ($orderData['items'] as $item) {
                $order->items()->create([
                    'product_id' => $item['product']?->id,
                    'product_variant_id' => $item['product']?->variants()->value('id'),
                    'product_name' => $item['name'],
                    'variant_name' => $item['variant'],
                    'unit_price' => $item['price'],
                    'quantity' => $item['qty'],
                    'line_total' => $item['price'] * $item['qty'],
                ]);
            }
        }
    }

    private function seedCatering(?User $admin): void
    {
        $records = [
            [
                'reference_number' => 'CAT-2026-000001',
                'customer_name' => 'Amina Yusuf',
                'email' => 'amina@example.test',
                'phone' => '+2348000005050',
                'event_type' => 'Wedding Reception',
                'event_date' => '2026-09-12 14:00:00',
                'number_of_guests' => 250,
                'location' => 'Lekki, Lagos',
                'budget' => 'NGN 4.5m - 5m',
                'requirements' => 'Premium rice, proteins, service support, and dessert station.',
                'status' => CateringInquiryStatus::Quoted,
            ],
            [
                'reference_number' => 'CAT-2026-000002',
                'customer_name' => 'Deloitte Lagos',
                'email' => 'corporate@example.test',
                'phone' => '+2348000006060',
                'event_type' => 'Corporate Lunch',
                'event_date' => '2026-08-29 12:30:00',
                'number_of_guests' => 80,
                'location' => 'Victoria Island, Lagos',
                'budget' => 'NGN 1.2m - 1.5m',
                'requirements' => 'Executive lunch trays and drinks for a corporate team.',
                'status' => CateringInquiryStatus::Confirmed,
            ],
            [
                'reference_number' => 'CAT-2026-000003',
                'customer_name' => 'Tolu Adebayo',
                'email' => 'tolu@example.test',
                'phone' => '+2348000007070',
                'event_type' => 'Birthday Dinner',
                'event_date' => '2026-09-03 18:00:00',
                'number_of_guests' => 35,
                'location' => 'Ikoyi, Lagos',
                'budget' => 'NGN 450k - 700k',
                'requirements' => 'Small chops, rice tray, proteins, and dessert cups.',
                'status' => CateringInquiryStatus::New,
            ],
        ];

        foreach ($records as $record) {
            CateringInquiry::query()->updateOrCreate(
                ['reference_number' => $record['reference_number']],
                [
                    ...$record,
                    'assigned_to_user_id' => $admin?->id,
                ],
            );
        }
    }

    private function seedContactMessages(?User $admin): void
    {
        $records = [
            [
                'reference_number' => 'MSG-2026-000001',
                'name' => 'Chimamanda Eze',
                'email' => 'chimamanda@example.test',
                'phone' => '+2348000008080',
                'subject' => 'Private dinner availability',
                'message' => 'I would like to discuss a private dinner menu for 12 guests next week.',
                'status' => ContactMessageStatus::Read,
                'read_at' => '2026-08-26 11:00:00',
            ],
            [
                'reference_number' => 'MSG-2026-000002',
                'name' => 'Kemi Johnson',
                'email' => 'kemi@example.test',
                'phone' => '+2348000009090',
                'subject' => 'Delivery coverage',
                'message' => 'Do you deliver to Ajah for tray orders on Saturdays?',
                'status' => ContactMessageStatus::New,
                'read_at' => null,
            ],
        ];

        foreach ($records as $record) {
            ContactMessage::query()->updateOrCreate(
                ['reference_number' => $record['reference_number']],
                [
                    ...$record,
                    'assigned_to_user_id' => $admin?->id,
                ],
            );
        }
    }

    private function seedReferenceCounters(): void
    {
        $year = now()->year;

        $counters = [
            'order' => 4,
            'catering' => 3,
            'contact' => 2,
        ];

        foreach ($counters as $scope => $currentNumber) {
            ReferenceCounter::query()->updateOrCreate(
                [
                    'scope' => $scope,
                    'year' => $year,
                ],
                [
                    'current_number' => $currentNumber,
                ],
            );
        }
    }
}
