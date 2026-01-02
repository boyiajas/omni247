<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Omni247 - Global Incident Reporting Platform</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .container {
            max-width: 900px;
            width: 100%;
        }

        .header {
            text-align: center;
            color: white;
            margin-bottom: 50px;
        }

        .header h1 {
            font-size: 48px;
            font-weight: 800;
            margin-bottom: 16px;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }

        .header p {
            font-size: 20px;
            opacity: 0.95;
        }

        .portals {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
        }

        .portal-card {
            background: white;
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            transition: all 0.3s;
            text-decoration: none;
            color: inherit;
            display: block;
        }

        .portal-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4);
        }

        .portal-icon {
            font-size: 60px;
            margin-bottom: 20px;
        }

        .portal-card h2 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 12px;
            color: #1f2937;
        }

        .portal-card p {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 24px;
            line-height: 1.6;
        }

        .portal-button {
            display: inline-block;
            padding: 14px 32px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.2s;
            text-decoration: none;
        }

        .client-portal .portal-button {
            background: #667eea;
            color: white;
        }

        .client-portal .portal-button:hover {
            background: #5568d3;
        }

        .admin-portal .portal-button {
            background: #1f2937;
            color: white;
        }

        .admin-portal .portal-button:hover {
            background: #111827;
        }

        .footer {
            text-align: center;
            color: white;
            margin-top: 40px;
            opacity: 0.9;
        }

        @media (max-width: 768px) {
            .header h1 {
                font-size: 36px;
            }

            .portal-card {
                padding: 30px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌐 Omni247</h1>
            <p>Global Incident Reporting Platform</p>
        </div>

        <div class="portals">
            <a href="{{ $clientPortalUrl }}" class="portal-card client-portal">
                <div class="portal-icon">👤</div>
                <h2>Client Portal</h2>
                <p>Access your account, create reports, view news feed, and track your rewards.</p>
                <span class="portal-button">Enter Client Portal</span>
            </a>

            <a href="{{ $adminPortalUrl }}" class="portal-card admin-portal">
                <div class="portal-icon">🛡️</div>
                <h2>Admin Portal</h2>
                <p>Manage reports, users, alerts, and monitor platform activity.</p>
                <span class="portal-button">Enter Admin Portal</span>
            </a>
        </div>

        <div class="footer">
            <p>© {{ date('Y') }} Omni247. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
