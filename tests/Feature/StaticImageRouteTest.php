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
}
