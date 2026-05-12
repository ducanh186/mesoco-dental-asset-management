<?php

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/');
$publicPath = realpath(__DIR__ . '/../../public');
$requestedFile = $publicPath ? realpath($publicPath . $uri) : false;

if ($publicPath && $uri !== '/' && $requestedFile && str_starts_with($requestedFile, $publicPath . DIRECTORY_SEPARATOR) && is_file($requestedFile)) {
    return false;
}

require $publicPath . '/index.php';