# MER — FitPower

Modelo Entidad-Relación de la base de datos PostgreSQL del proyecto.

## Diagrama

```mermaid
erDiagram
    USERS ||--o{ ENROLLMENTS : "se anota"
    USERS ||--o{ LOGIN_EVENTS : "registra"
    ACTIVITIES ||--o{ CLASS_SESSIONS : "tiene"
    CLASS_SESSIONS ||--o{ ENROLLMENTS : "recibe"
    LOGIN_ATTEMPTS }o--|| LOGIN_ATTEMPTS : "por IP"

    USERS {
        serial id PK
        varchar name
        varchar email UK
        varchar password_hash
        varchar role
        timestamptz created_at
        timestamptz updated_at
    }

    ACTIVITIES {
        serial id PK
        varchar name UK
        varchar slug UK
        varchar image_url
        timestamptz created_at
    }

    CLASS_SESSIONS {
        serial id PK
        int activity_id FK
        smallint day_of_week
        time start_time
        int duration_minutes
        int capacity
        varchar professor_name
        timestamptz created_at
    }

    ENROLLMENTS {
        serial id PK
        int user_id FK
        int class_session_id FK
        timestamptz created_at
    }

    LOGIN_EVENTS {
        serial id PK
        int user_id FK
        timestamptz logged_at
    }

    LOGIN_ATTEMPTS {
        serial id PK
        varchar ip
        timestamptz attempted_at
    }
```

## Entidades

### USERS (Usuario)
Persona que inicia sesión en la app.

| Atributo | Tipo | Notas |
| --- | --- | --- |
| id | SERIAL PK | |
| name | VARCHAR(120) | Nombre visible en dashboard |
| email | VARCHAR(255) UNIQUE | Login |
| password_hash | VARCHAR(255) | Hash bcrypt/argon (`password_hash`) |
| role | VARCHAR(20) | `admin` \| `entrenador` \| `usuario` |
| created_at / updated_at | TIMESTAMPTZ | |

### ACTIVITIES (Actividad)
Disciplina del gimnasio (Boxeo, Pilates, etc.).

| Atributo | Tipo | Notas |
| --- | --- | --- |
| id | SERIAL PK | |
| name | VARCHAR(80) UNIQUE | |
| slug | VARCHAR(80) UNIQUE | Identificador URL |
| image_url | VARCHAR(255) | Imagen de la card |
| created_at | TIMESTAMPTZ | |

### CLASS_SESSIONS (Clase / horario)
Instancia programable de una actividad en un día/hora.

| Atributo | Tipo | Notas |
| --- | --- | --- |
| id | SERIAL PK | |
| activity_id | FK → ACTIVITIES | |
| day_of_week | SMALLINT 1–7 | 1=LUN … 7=DOM |
| start_time | TIME | |
| duration_minutes | INT | Default 60 |
| capacity | INT | Cupos máximos |
| professor_name | VARCHAR(120) | |
| created_at | TIMESTAMPTZ | |

### ENROLLMENTS (Inscripción)
Relación N:M entre usuario y clase.

| Atributo | Tipo | Notas |
| --- | --- | --- |
| id | SERIAL PK | |
| user_id | FK → USERS | |
| class_session_id | FK → CLASS_SESSIONS | |
| created_at | TIMESTAMPTZ | |
| UNIQUE(user_id, class_session_id) | | Evita doble inscripción |

### LOGIN_EVENTS
Auditoría de logins exitosos (contador semanal del dashboard).

### LOGIN_ATTEMPTS
Intentos fallidos por IP (rate limiting).

## Cardinalidades

- Un **USER** tiene muchas **ENROLLMENTS** (0..N).
- Una **CLASS_SESSION** tiene muchas **ENROLLMENTS** (0..N).
- Una **ACTIVITY** tiene muchas **CLASS_SESSIONS** (1..N típico).
- Un **USER** genera muchos **LOGIN_EVENTS**.

## Roles de negocio

| role | Uso |
| --- | --- |
| admin | Administración |
| entrenador | Personal del gimnasio |
| usuario | Socio / cliente del dashboard |

## Archivos relacionados

- Migraciones: `api/database/migrations/`
- Seed: `api/database/seed.php`
