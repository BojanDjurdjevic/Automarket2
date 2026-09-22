<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework. You can also check out [Laravel Learn](https://laravel.com/learn), where you will be guided through building a modern Laravel application.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## AutoMarket local development and production checklist

This repository contains the Laravel API in `backend` and the custom TypeScript SPA in `frontend`. Run `composer dev` in the backend and `pnpm dev` in the frontend as separate processes. The backend has no Node build. Copy each directory's `.env.example` to its local `.env` before setup; keep both environment files out of Git.

### Before deploying to shared hosting

No deployment has been performed. Confirm these details with the hosting plan before uploading:

- Use compatible PHP (the audit ran on PHP 8.3), the extensions required by `composer check-platform-reqs --no-dev`, PDO MySQL, and GD with WebP support for image processing. Set upload/post limits high enough for the supported 10 files per request of up to 5 MiB each, including multipart overhead. Confirm memory and request limits against actual images.
- Point the API document root at Laravel's `public` directory. Keep `.env`, application source, `vendor`, logs, and database files outside the document root. Do not move `public/index.php` into the project root. Confirm the hosting plan supports the required document root and rewrite configuration.
- Serve the frontend's built `dist` directory separately. Configure its web server to serve `index.html` for SPA routes such as `/cars/123`, without intercepting API or storage requests. No hosting-specific rewrite file is supplied because the final document roots are not yet known.
- Use HTTPS for both applications on the same site, typically sibling subdomains. Set backend `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL` to the API origin, and `FRONTEND_URL` to the exact frontend origin. Set frontend `VITE_API_URL` to the API origin **without `/api`** before building. Vite variables are public build-time values: never place credentials in them.
- Set `SANCTUM_STATEFUL_DOMAINS` to frontend host names without schemes, including ports in local development. For sibling subdomains, set `SESSION_DOMAIN` to their shared parent domain and `SESSION_SECURE_COOKIE=true`; keep `SESSION_SAME_SITE=lax`. A same-host installation can use a host-only cookie. Unrelated frontend/backend domains require a different cookie design and have not been verified here.
- Configure production database credentials, preserve the production `APP_KEY`, and take a backup before migrations. Use the committed Composer and pnpm lockfiles. Do not upload local `.env`, test databases, or audit artifacts under `storage/app/audit`.
- Configure a real mail transport and sender. `MAIL_MAILER=log` does not deliver email and writes signed verification/reset links into local logs. Restrict log access and retention. Test delivery, expiry, tampering rejection, and frontend links on the final HTTPS domains.
- Make `storage` and `bootstrap/cache` writable by the PHP process. Create the public storage link and verify `/storage/...` images over HTTPS. Confirm symlink support with the host; keep uploaded files non-executable. Back up both the database and public image storage.

Typical preparation commands, to run only on the intended deployment after configuring the above:

```sh
# backend
composer install --no-dev --prefer-dist --optimize-autoloader
composer check-platform-reqs --no-dev
php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache

# frontend: build locally or in CI, then upload dist
pnpm install --frozen-lockfile
pnpm build
```

Generate an application key only for a new installation that has no existing key. The production `DatabaseSeeder` populates reference tables and skips demo users/cars; existing data is not removed. Local demo car factories still describe placeholder image paths without creating files, so do not use them as production image fixtures. Mail notifications are synchronous; no application queue job currently requires a worker. If queued work is introduced later, configure a reliable worker or hosting-supported scheduled runner first. `vite preview` is a local build preview, not a production server.

### Verification and operational limits

Run `php artisan test` in the backend and `pnpm build` in the frontend. Backend tests use an in-memory SQLite database; they do not modify the application's MySQL data. Recheck `composer audit` and `pnpm audit` before deployment.

Image database changes use transactions, uploads clean up files after failure, and destructive file cleanup waits for commit. The database and filesystem cannot commit atomically: a process crash or disk failure after commit can still leave orphaned files. Monitor reported storage errors and reconcile image records/storage from backups as needed. Existing duplicate primary images or older orphaned files are not modified by this audit.

Public car visibility currently follows the existing implementation regardless of `draft`, `active`, or `sold` status. Decide the intended publishing rules before adding visibility restrictions; this pass does not invent a new listing workflow. Public resources also retain the existing seller contact fields.

See the [Laravel deployment guide](https://laravel.com/docs/12.x/deployment) and [Vite static deployment guide](https://vite.dev/guide/static-deploy.html) for the underlying deployment requirements.
