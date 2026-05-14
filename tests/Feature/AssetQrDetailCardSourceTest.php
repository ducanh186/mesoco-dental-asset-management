<?php

namespace Tests\Feature;

use Tests\TestCase;

class AssetQrDetailCardSourceTest extends TestCase
{
    public function test_asset_detail_qr_card_renders_scannable_qr_image(): void
    {
        $source = file_get_contents(resource_path('js/pages/AssetsPage.jsx'));

        $this->assertStringContainsString('data-testid="asset-detail-qr-image"', $source);
        $this->assertStringContainsString('alt="QR thiết bị để quét"', $source);
        $this->assertStringContainsString('buildQrDataUrl(printableQrValue', $source);
    }
}
