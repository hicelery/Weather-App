# Weather App - Deployment Guide

## Heroku Deployment Steps

### 1. Prerequisites

- Heroku CLI installed
- Git repository initialized
- PostgreSQL database ready (Heroku will provision this)

### 2. Create Heroku App

```bash
heroku create your-weather-app-name
```

### 3. Add Postgres Add-on

```bash
heroku addons:create heroku-postgresql:hobby-dev
```

### 4. Configure Environment Variables

Copy `.env.example` to `.env` and update with your actual values:

```bash
heroku config:set SECRET_KEY=your-django-secret-key
heroku config:set DEBUG=False
heroku config:set OPENWEATHER_API_KEY=your-openweather-api-key
heroku config:set CLOUDINARY_CLOUD_NAME=your-cloud-name
heroku config:set CLOUDINARY_API_KEY=your-cloudinary-api-key
heroku config:set CLOUDINARY_API_SECRET=your-cloudinary-api-secret
heroku config:set EMAIL_HOST_USER=your-email@gmail.com
heroku config:set EMAIL_HOST_PASSWORD=your-app-password
```

To set all at once from `.env`:

```bash
heroku config:set-f .env
```

### 5. Collect Static Files

```bash
python manage.py collectstatic --noinput
```

### 6. Push to Heroku

```bash
git add .
git commit -m "Ready for deployment"
git push heroku main
```

### 7. Run Migrations

```bash
heroku run python manage.py migrate
heroku run python manage.py createsuperuser
```

### 8. Open App

```bash
heroku open
```

## Production Settings

The app automatically uses production settings when `DEBUG=False`:

- SSL/TLS enforcement
- Secure cookies
- CSRF protection
- Security headers
- WhiteNoise for static files

## Troubleshooting

Check logs:

```bash
heroku logs --tail
```

Run Django shell:

```bash
heroku run python manage.py shell
```

## Getting API Keys

### OpenWeather API

1. Go to https://openweathermap.org/api
2. Sign up for free account
3. Copy API key from dashboard

### Cloudinary

1. Go to https://cloudinary.com/
2. Create free account
3. Get Cloud Name, API Key, and API Secret from dashboard

### Gmail (Email)

1. Enable 2-Step Verification
2. Create App Password
3. Use that as EMAIL_HOST_PASSWORD

## Monitoring

Monitor app health:

```bash
heroku ps
heroku logs --tail --app your-app-name
```

View database:

```bash
heroku pg:info
```

Backup database:

```bash
heroku pg:backups:capture
```
