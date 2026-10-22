# Front FitPower

Estructura del frontend:

```text
front/
├── index.html              # Landing
├── .htaccess               # Rutas amigables + compatibilidad
├── pages/                  # Vistas HTML (login, dashboards, planes…)
├── assets/
│   ├── css/
│   │   ├── shared/         # loader, motion, footer, settings, chat…
│   │   └── pages/          # estilos por pantalla (login, dashboard…)
│   ├── js/
│   │   ├── shared/         # site, api, auth, i18n, settings…
│   │   ├── admin/
│   │   ├── entrenador/
│   │   └── usuario/
│   └── img/
│       ├── brand/          # favicon, logo
│       ├── activities/     # fotos de actividades
│       └── ui/             # mapa y extras de interfaz
└── design/                 # mockups de diseño (no se usan en runtime)
```

URLs públicas:

| Ruta | Archivo |
| --- | --- |
| `/` | `index.html` |
| `/login` | `pages/login.html` |
| `/dashboard` | `pages/DashboardUsu.html` |
| `/dashboard-entrenador` | `pages/DashboardEntrenador.html` |
| `/dashboard-admin` | `pages/DashboardAdmin.html` |
| `/rutinas` | `pages/Rutinas.html` |
| `/planes` | `pages/Planes.html` |
| `/compra` | `pages/Compra.html` |
