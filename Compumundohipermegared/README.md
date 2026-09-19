# FitPower

Aplicación web del gimnasio FitPower: landing pública, login y dashboard de usuario.

## Requisitos

- Docker Desktop (incluye Docker Compose)
- Git (opcional)

No hace falta instalar PHP ni MySQL en el host: ambos corren en contenedores.

## Instalación

1. Copiá las variables de entorno:

```bash
cp .env.example .env
```

En Windows (PowerShell):

```powershell
Copy-Item .env.example .env
```

2. Revisá `.env`. Los valores de ejemplo son **solo para desarrollo**.

También podés copiar `api/.env.example` a `api/.env` si vas a ejecutar scripts de PHP fuera de Docker.

## Variables de entorno

| Variable | Uso |
| --- | --- |
| `DB_HOST` | Host de MySQL (`db` dentro de Docker) |
| `DB_PORT` | Puerto interno del contenedor (`3306`) |
| `DB_HOST_PORT` | Puerto publicado en tu PC (por defecto `3307`) |
| `DB_NAME` | Nombre de la base |
| `DB_USER` | Usuario de la base |
| `DB_PASSWORD` | Contraseña de la base |
| `JWT_SECRET` | Secreto para firmar sesiones (cambiar en cada entorno) |
| `JWT_TTL_SECONDS` | Duración del token en segundos (por defecto 86400) |
| `API_BASE_PATH` | Prefijo de la API (`/api`) |
| `APP_DEBUG` | `false` en uso normal |

Nunca subas secretos reales al repositorio. `.env` está ignorado por git.

## Base de datos

MySQL 8 se inicia con volumen persistente:

```bash
docker compose up -d --build
```

Para detener los contenedores (los datos se conservan):

```bash
docker compose down
```

Para borrar también el volumen (se pierden los datos):

```bash
docker compose down -v
```

## Migraciones

Al levantar el contenedor `app`, se ejecutan solas:

```text
php /var/www/html/api/database/migrate.php
```

Si necesitás correrlas a mano:

```bash
docker compose exec app php /var/www/html/api/database/migrate.php
```

## Seed

El seed de desarrollo se ejecuta automáticamente si la tabla `users` está vacía.

Usuario de prueba (**no usar en producción**):

| Rol | Email | Contraseña |
| --- | --- | --- |
| Administrador | `admin@fitpower.com` | `cambiar-en-desarrollo` |
| Entrenador | `entrenador@fitpower.com` | `cambiar-en-desarrollo` |
| Usuario | `usuario@fitpower.com` | `cambiar-en-desarrollo` |

La contraseña se guarda con `password_hash` de PHP (bcrypt/Argon según la versión), nunca en texto plano.

Idioma: en landing, login y dashboard hay un botón **ES/EN** para traducir la interfaz.

## Aplicación

Con Docker en marcha, abrí:

- Landing: http://localhost:8080/
- Login: http://localhost:8080/login
- Dashboard usuario: http://localhost:8080/dashboard
- Dashboard entrenador: http://localhost:8080/dashboard-entrenador
- Dashboard administrador: http://localhost:8080/dashboard-admin
- API: http://localhost:8080/api

## Login

| Rol | Email | Contraseña | Destino |
| --- | --- | --- | --- |
| Administrador | `admin@fitpower.com` | `cambiar-en-desarrollo` | `/dashboard-admin` |
| Entrenador | `entrenador@fitpower.com` | `cambiar-en-desarrollo` | `/dashboard-entrenador` |
| Usuario | `usuario@fitpower.com` | `cambiar-en-desarrollo` | `/dashboard` |

1. Entrá a http://localhost:8080/login
2. Usá la cuenta según el rol
3. Solo el administrador entra a `/dashboard-admin` y puede crear/eliminar usuarios
4. Solo el entrenador entra a `/dashboard-entrenador`
5. El usuario entra a `/dashboard`

## Arquitectura

```text
Frontend (HTML/CSS/JS + Bootstrap)
        ↓
API PHP (Apache)
        ↓
JWT + password_hash
        ↓
MySQL 8 (Docker, volumen persistente)
```

Modelo entidad-relación: ver [`docs/MER.md`](docs/MER.md).

No se agregaron dependencias de Composer. JWT se firma con HMAC-SHA256 nativo de PHP.
