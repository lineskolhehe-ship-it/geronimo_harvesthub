<?php

return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    // React dev server. Set FRONTEND_URL in .env for production.
    'allowed_origins' => array_filter(explode(',', env('FRONTEND_URL', 'http://localhost:5173'))),
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
