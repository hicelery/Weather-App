# Quick Reference Guide - Django Weather App

## 🚀 LOCAL DEVELOPMENT - QUICK START

### Setup (First Time)

```bash
cd Weather-App
python -m venv venv
source venv/bin/activate              # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
```

### Run Server

```bash
python manage.py runserver
# Open http://localhost:8000
```

## 📝 IMPORTANT FILES TO CONFIGURE

### 1. Environment Variables (env.py or .env)

```python
# Get from https://openweathermap.org/
OPENWEATHER_API_KEY = 'your-key-here'

# Get from https://cloudinary.com/
CLOUDINARY_CLOUD_NAME = 'your-name'
CLOUDINARY_API_KEY = 'your-key'
CLOUDINARY_API_SECRET = 'your-secret'

# Database (optional - defaults to SQLite locally)
DATABASE_URL = 'postgresql://user:pass@localhost:5432/weather_db'

# Email (optional - for testing, console backend is used)
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-app-password'
```

### 2. Required API Keys

Get these for full functionality:

- [OpenWeather API](https://openweathermap.org/api) - **REQUIRED**
- [Cloudinary](https://cloudinary.com/) - Optional (for profile pictures)
- Gmail App Password - Optional (for email verification)

## 🔑 KEY URLS

| URL                         | Purpose              | Auth Required |
| --------------------------- | -------------------- | ------------- |
| /                           | Home/Dashboard       | No            |
| /api/weather/               | Weather AJAX         | No            |
| /api/search/                | Search AJAX          | No            |
| /favorites/                 | Favorites page       | YES           |
| /favorites/api/add/         | Add favorite AJAX    | YES           |
| /favorites/api/remove/<id>/ | Remove favorite AJAX | YES           |
| /accounts/login/            | Login                | No            |
| /accounts/signup/           | Register             | No            |
| /accounts/logout/           | Logout               | YES           |
| /admin/                     | Admin panel          | YES (staff)   |

## 📁 IMPORTANT DIRECTORIES

```
/templates/              - All HTML files
/static/css/            - Custom CSS
/static/js/             - Custom JavaScript
/weather/               - Weather app code
/favorites/             - Favorites app code
/users/                 - User profiles
/weatherproject/        - Main project config
```

## 🐛 COMMON TASKS

### Create Superuser (Admin)

```bash
python manage.py createsuperuser
```

### Make Migrations (after model changes)

```bash
python manage.py makemigrations
python manage.py migrate
```

### Collect Static Files (for production)

```bash
python manage.py collectstatic --noinput
```

### Create Database Shell

```bash
python manage.py shell
```

### Run Tests

```bash
python manage.py test
```

### Clear Database Cache

```bash
python manage.py flush
```

## 🔍 DEBUGGING

### Check Syntax Errors

```bash
python manage.py check
```

### View Database Queries

Add to settings.py for DEBUG:

```python
LOGGING = {
    'version': 1,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django.db.backends': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
```

### Django Shell for Testing

```bash
python manage.py shell
>>> from weather.models import Location
>>> Location.objects.all()
>>> from django.contrib.auth.models import User
>>> User.objects.all()
```

## 🎨 CUSTOMIZATION QUICK TIPS

### Change App Theme

Edit: `static/css/styles.css`

- Line 7-11: `:root` color variables
- Line 215+: Button styles
- Line 290+: Card styles

### Add New Weather Icons

Edit: `static/js/script.js`

- Add icon codes to `weatherIcons` object around line 11
- Use Font Awesome classes

### Modify Templates

Edit: `templates/weather/home.html` or `templates/favorites/list.html`

- HTML structure with Bootstrap 5
- Use `{% %} for Django template tags
- Use {{ }} for variables

### Add API Endpoint

1. Create view in app/views.py
2. Add URL in app/urls.py
3. Add to weatherproject/urls.py
4. Call from JavaScript

## 📊 MODEL REFERENCE

### UserProfile

```python
user (User)              # Link to Django User
bio (text)               # User biography
profile_picture (image)  # Cloudinary image
default_location (str)   # Preferred location
location_history_enabled (bool)  # Track history
```

### Location

```python
name (str)               # City name
country (str)            # Country
latitude (float)         # GPS latitude
longitude (float)        # GPS longitude
```

### FavoriteLocation

```python
user (FK)                # Reference to User
location (FK)            # Reference to Location
added_at (datetime)      # When added
```

## 🚢 DEPLOYMENT CHECKLIST

Before pushing to Heroku:

- [ ] Set all environment variables
- [ ] Update ALLOWED_HOSTS
- [ ] Set DEBUG = False
- [ ] Generate new SECRET_KEY
- [ ] Set DATABASE_URL
- [ ] Configure email settings
- [ ] Get OpenWeather API key
- [ ] Setup Cloudinary (optional)
- [ ] Run `python manage.py collectstatic`
- [ ] Test locally first!

## 🆘 TROUBLESHOOTING QUICK FIXES

| Problem                  | Solution                                       |
| ------------------------ | ---------------------------------------------- |
| Static files not loading | Run `python manage.py collectstatic --noinput` |
| "API key not configured" | Add OPENWEATHER_API_KEY to env.py              |
| Database errors          | Run `python manage.py migrate`                 |
| Template not found       | Check TEMPLATES DIRS in settings.py            |
| 404 on URLs              | Check weatherproject/urls.py and app/urls.py   |
| CSRF error               | Add `{% csrf_token %}` to forms                |
| Cloudinary not working   | Check CLOUDINARY settings in settings.py       |
| Email not sending        | Set EMAIL_BACKEND to console for testing       |

## 📚 USEFUL DJANGO COMMANDS

```bash
# Run development server
python manage.py runserver

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Access Django shell
python manage.py shell

# Run tests
python manage.py test

# Collect static files
python manage.py collectstatic

# Check for issues
python manage.py check

# Flush database (WARNING - deletes data)
python manage.py flush

# Create fixture (backup data)
python manage.py dumpdata > data.json

# Load fixture (restore data)
python manage.py loaddata data.json
```

## 🌐 WORKING WITH AJAX

### Make POST Request

```javascript
fetch("/api/weather/", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify({ key: "value" }),
})
    .then((response) => response.json())
    .then((data) => console.log(data));
```

### Handle JSON Response

```javascript
if (data.error) {
    console.error(data.error);
} else {
    // Process successful response
}
```

## 📝 COMMON EDITS

### Add New Model

1. Create in app/models.py
2. Run makemigrations and migrate
3. Register in app/admin.py
4. Create views in app/views.py

### Add New URL

1. Create view function
2. Add to app/urls.py
3. Add to weatherproject/urls.py (if root level)

### Add New Template

1. Create HTML file in templates/app/
2. Create view that returns render()
3. Add URL mapping

### Add New Static File

1. Add CSS to static/css/
2. Add JS to static/js/
3. Include in templates: `{% load static %}` and `href="{% static 'file' %}"`

## 🔐 SECURITY REMINDERS

- Never commit env.py or .env files (they're in .gitignore)
- Always use CSRF tokens in forms
- Validate user input on backend
- Use HTTPS in production
- Keep dependencies updated
- Don't expose secrets in code
- Use environment variables for keys

## 💡 TIPS & TRICKS

- Use Django debug toolbar for optimization
- Test email locally with console backend
- Use `django-extensions` for better shell
- Check browser DevTools for AJAX errors
- Use `print()` debugging in views
- Check `heroku logs --tail` for production errors
- Use postman to test API endpoints
- Cache API responses to save quota

---

**Last Updated**: March 3, 2026
**Version**: 1.0
