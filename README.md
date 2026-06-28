# EASTC Students Organization Portal - Backend Setup

## What's New

This is now a **full-stack website** with a PHP backend and MySQL database.

## File Structure

```
EASTCSO/
├── index.html          # Frontend (no changes needed)
├── style.css           # Styles (no changes needed)
├── script.js           # Frontend JS (connects to API)
├── img/
│   └── logoo.png
├── backend/            # PHP API Backend
│   ├── config.php      # Database config (EDIT THIS)
│   ├── init.php        # Run once to create tables + default data
│   ├── auth.php        # Admin login
│   ├── site-info.php   # Site info (GET/PUT)
│   ├── leaders.php     # Leaders CRUD
│   ├── events.php      # Events CRUD
│   ├── announcements.php # Announcements CRUD
│   ├── activities.php  # Activities CRUD
│   ├── gallery.php     # Gallery CRUD
│   ├── upload.php      # Image upload handler
│   ├── reset.php       # Reset all data to defaults
│   └── uploads/        # Uploaded images folder
```

## Setup Steps

### 1. Create a MySQL Database

Create a database (e.g., `eastc_db`) on your hosting or local server.

### 2. Edit Database Config

Open `backend/config.php` and update:

```php
$db_host = 'localhost';     // Your database host
$db_name = 'eastc_db';      // Your database name
$db_user = 'root';          // Your database username
$db_pass = '';              // Your database password
```

### 3. Run Init Script

Visit this URL in your browser **once** to create tables and insert default data:

```
https://yourdomain.com/EASTCSO/backend/init.php
```

Or if running locally with XAMPP/WAMP:

```
http://localhost/EASTCSO/backend/init.php
```

You should see: `{"success": true, "message": "Database initialized..."}`

### 4. Make Uploads Folder Writable

The `backend/uploads/` folder must be writable for image uploads:

```bash
chmod 755 backend/uploads/
```

(Your hosting file manager can also set permissions.)

### 5. Access the Site

Open `index.html` or `http://localhost/EASTCSO/`

## Admin Login

- Click **Admin** in the navigation menu
- Username: `admin`
- Password: `eastc2026`

## What the Admin Can Do

| Feature | Description |
|---------|-------------|
| **Activities** | Add, edit, delete activities (admin-only) |
| **Events** | Add, edit, delete events with **photo uploads** |
| **Announcements** | Add, edit, delete announcements |
| **Leaders** | Add, edit, delete leaders with **photo uploads** |
| **Gallery** | Add, edit, delete gallery images with **photo uploads** |
| **Site Info** | Edit title, tagline, welcome message, logo, mission items, footer text |

## Image Uploads

All images uploaded through the admin panel are saved to `backend/uploads/` and stored as file paths in the database. This is much more efficient than base64 encoding.

## API Endpoints

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `backend/auth.php` | POST | Admin login |
| `backend/site-info.php` | GET, PUT | Site info |
| `backend/leaders.php` | GET, POST, PUT, DELETE | Leaders |
| `backend/events.php` | GET, POST, PUT, DELETE | Events |
| `backend/announcements.php` | GET, POST, PUT, DELETE | Announcements |
| `backend/activities.php` | GET, POST, PUT, DELETE | Activities |
| `backend/gallery.php` | GET, POST, PUT, DELETE | Gallery |
| `backend/upload.php` | POST | Image upload (admin only) |
| `backend/reset.php` | POST | Reset all data to defaults |

## Using Supabase Instead

If you want to use **Supabase** instead of hosting your own PHP + MySQL:

1. Don't use the PHP backend at all
2. Use Supabase's JavaScript client (`@supabase/supabase-js`) in `script.js`
3. Connect directly to your Supabase project URL and anon key
4. Use Supabase Auth, Storage, and Database

The PHP backend is provided for easy deployment on any shared hosting (cPanel, XAMPP, etc.).

## Troubleshooting

### CORS errors
- If you see CORS errors, make sure `config.php` has the right `Access-Control-Allow-Origin` header

### Database connection fails
- Check your database credentials in `config.php`
- Make sure the database exists
- MySQL must be running

### Uploads fail
- Check `backend/uploads/` folder permissions (must be writable)
- Max file size: 2MB (can be changed in `upload.php`)
- Allowed types: JPG, PNG, GIF, WebP

### 500 Internal Server Error
- Check PHP error logs
- Make sure PHP 7.4+ is installed
- MySQLi or PDO extension must be enabled
