<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Omni247 Client Portal</title>
    <script>
        window.GOOGLE_MAPS_KEY = @json(config('services.google.maps_key'));
    </script>
    @vite(['resources/css/client.css', 'resources/js/client.js'])
</head>
<body>
    <div id="app"></div>
</body>
</html>
