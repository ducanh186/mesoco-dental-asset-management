<?php

namespace Tests\Feature;

use Tests\TestCase;

class StaticImageRouteTest extends TestCase
{
    public function test_mesoco_logo_is_served_as_an_image_before_spa_fallback(): void
    {
        $this->get('/images/mesoco_logo.png')
            ->assertOk()
            ->assertHeader('content-type', 'image/png');
    }

    public function test_spa_assets_do_not_force_localhost_when_opened_from_lan_host(): void
    {
        $response = $this->withHeader('Host', '192.168.123.8:8000')->get('/assets');

        $response->assertOk();
        $this->assertStringNotContainsString('http://localhost:8000/build/', $response->getContent());
    }
}
