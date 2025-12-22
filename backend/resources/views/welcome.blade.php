<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>G-iReport Control Center</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <script>
        window.GOOGLE_MAPS_KEY = @json(config('services.google.maps_key'));
    </script>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="antialiased">
    <div id="dashboard-app"></div>
</body>
</html>
