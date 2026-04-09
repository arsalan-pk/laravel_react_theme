# Laravel + React + Inertia Starter Template

A modern, full-stack starter template built with Laravel 11, React, Inertia.js, and Tailwind CSS. This polarplate provides a solid foundation for building web applications with a reactive frontend and robust backend.

## Table of Contents
- [Requirements](#requirements)
- [Installation](#installation)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [License](#license)

## Requirements

To run this application, ensure you have the following installed:

- **PHP**: 8.2 or higher
- **Laravel**: 11
- **Node.js**: 18+ (for Vite and React)
- **MySQL**: 8.0+ (for the database)
- **Composer**: Latest version

## Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repository-url>
   cd <your-project-name>
   ```

2. **Install PHP dependencies**:
   ```bash
   composer install
   ```

3. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

4. **Set up your environment file**:
   ```bash
   cp .env.example .env
   ```
   Then configure your database and other settings in `.env`.

5. **Generate the application key**:
   ```bash
   php artisan key:generate
   ```

6. **Create the Database**:

   Set up a new database in MySQL and update the database details in the `.env` file:

   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=your_database_name
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   ```

7. **Run migrations**:
   ```bash
   php artisan migrate --seed
   ```

8. **Link Storage**:
   ```bash
   php artisan storage:link
   ```

## Tech Stack

- **Backend**: Laravel 11 - Robust PHP framework with elegant syntax
- **Frontend**: React 18 - Modern JavaScript library for building user interfaces
- **Bridge**: Inertia.js - Seamless integration between Laravel and React
- **Styling**: Tailwind CSS - Utility-first CSS framework
- **Build Tool**: Vite - Fast build tool and dev server
- **Database**: MySQL - Reliable relational database
- **Authentication**: Laravel Breeze - Simple authentication scaffolding

## Project Structure

```
├── app/
│   ├── Http/
│   │   ├── Controllers/    # Laravel controllers
│   │   └── Middleware/     # Custom middleware
│   └── Models/             # Eloquent models
├── database/
│   ├── migrations/         # Database migrations
│   └── seeders/            # Database seeders
├── resources/
│   ├── js/
│   │   ├── Components/     # React components
│   │   ├── Context/        # React context providers
│   │   ├── Layouts/        # Layout components
│   │   └── app.jsx         # React entry point
│   └── views/              # Blade templates
├── routes/
│   ├── web.php             # Web routes
│   └── api.php             # API routes
└── tests/                  # Test files
```

## Getting Started

1. **Start the development servers**:

   In one terminal, start the Laravel server:
   ```bash
   php artisan serve
   ```

   In another terminal, start the Vite dev server:
   ```bash
   npm run dev
   ```

2. **Access the application**:
   Open your browser and navigate to `http://localhost:8000`

3. **Building for production**:
   ```bash
   npm run build
   ```

## Customization

This template is designed to be easily customizable. You can:
- Add new React components in `resources/js/Components/`
- Create new Laravel controllers in `app/Http/Controllers/`
- Define routes in `routes/web.php` and `routes/api.php`
- Create database migrations in `database/migrations/`
- Style your components using Tailwind CSS classes

## License

This project is licensed under the MIT License.

---

Feel free to customize this template for your next project. Happy coding! 🚀
