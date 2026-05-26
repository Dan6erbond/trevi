# Trevi Server

The backend API for Trevi, built with **Laravel** and designed to serve as a RESTful resource for the frontend. Follows Laravel conventions with a focus on clean, maintainable code and robust authorization.

## 🛠️ Tech Stack

| Area           | Technologies                        |
| -------------- | ----------------------------------- |
| Framework      | Laravel                             |
| Query Building | Spatie Laravel Query Builder        |
| API Pagination | JSON API Pagination Plugin          |
| Database       | PostgreSQL                          |
| Authentication | Laravel Sanctum (cookie-based)      |
| Authorization  | Laravel Policies                    |
| Docker         | Multi-stage builds (PHP-FPM, Nginx) |

## 📂 Project Structure

```text
app/
├── Models/          # Eloquent models (e.g., Restaurant, Visit)
│   ├── Enums/       # Enums for types (Reservation, Cuisine, etc.)
│   └── ...
├── Http/
│   ├── Controllers/ # API controllers (follows apiResource conventions)
│   └── ...
├── Policies/        # Authorization policies (e.g., RestaurantPolicy)
├── ...
docker/
├── common/
│   └── php-fpm/
│       ├── Dockerfile
│       └── conf.d/
│           └── 20-status-path.conf
└── production/
    └── nginx/
        ├── Dockerfile
        └── nginx.conf
.env.example         # Environment template
```

## 🏗️ Architecture

### Routing & Controllers

- Uses Laravel’s `apiResource` conventions for standard CRUD operations (`index`, `store`, `show`, `update`, `destroy`).
- Leverages **`scopeBindings()`** in `web.php` to automatically resolve parent models (e.g., `Team $team` in controller methods).

### Query Building

- **Spatie Laravel Query Builder** enables dynamic filtering, sorting, and includes via query parameters:
    - `?include=team`
    - `?fields[restaurants]=name,cuisine`
    - `?filter[name]=...`
    - `?page[size]=20&page[number]=1`
- Example from `RestaurantController@index`:
    ```php
    QueryBuilder::for(
        $team->restaurants()
            ->withMax('visits', 'visited_at')
            ->withAvg('visits', 'cost')
            ->withAvg('visits', 'party_size')
    )
        ->allowedIncludes('team')
        ->allowedFilters('name', 'cuisine', ...)
        ->jsonPaginate();
    ```

### Authorization

- **Policies** (e.g., `RestaurantPolicy`) define authorization logic.
- Routes use middleware for authorization:
    ```php
    Route::get('', [TeamController::class, 'show'])
        ->middleware('can:view,team');
    ```

## 🐳 Docker

### Development

A [`docker-compose.yml`](../docker-compose.yml) file is included in the workspace root for local development with PostgreSQL.

Run with:

```bash
docker compose up -d
```

### Production

- **PHP-FPM**: `docker/common/php-fpm/Dockerfile`
- **Nginx**: `docker/production/nginx/Dockerfile`
- Configuration files:
    - `nginx/nginx.conf`
    - `php-fpm/conf.d/20-status-path.conf`

## 🚀 Getting Started

### Prerequisites

- Docker & Docker Compose
- PHP 8.2+
- Composer

### Setup

1. Copy the environment file:
    ```bash
    cp .env.example .env
    ```
2. Configure your PostgreSQL connection in `.env` (or use the default `docker-compose.yml` settings).
3. Install dependencies:
    ```bash
    composer install
    ```
4. Generate the app key:
    ```bash
    php artisan key:generate
    ```
5. Run migrations:
    ```bash
    php artisan migrate
    ```
6. Start the development server:
    ```bash
    php artisan serve
    ```
    The API will be available at `http://localhost:8000`.
