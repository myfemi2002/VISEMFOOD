<?php

namespace Tests\Feature;

use App\Models\CateringInquiry;
use App\Models\ContactMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicInquiryApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_contact_message_can_be_submitted(): void
    {
        $response = $this->postJson('/api/v1/contact', [
            'name' => 'Jane Doe',
            'email' => 'jane@example.test',
            'phone' => '+2348000022222',
            'subject' => 'Delivery question',
            'message' => 'Do you handle same-day tray delivery in Lekki?',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.subject', 'Delivery question');

        $this->assertDatabaseCount('contact_messages', 1);
    }

    public function test_catering_inquiry_can_be_submitted(): void
    {
        $response = $this->postJson('/api/v1/catering', [
            'customer_name' => 'Amina Yusuf',
            'email' => 'amina@example.test',
            'phone' => '+2348000033333',
            'event_type' => 'Wedding Reception',
            'event_date' => '2026-09-12 14:00:00',
            'number_of_guests' => 250,
            'location' => 'Lekki, Lagos',
            'budget' => 'NGN 4.5m - 5m',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.customer_name', 'Amina Yusuf');

        $this->assertDatabaseCount('catering_inquiries', 1);
    }
}
