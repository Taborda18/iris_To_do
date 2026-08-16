# IRIS To-Do Frontend

Frontend de la prueba técnica de IRIS construido con Angular 22, componentes standalone, Signals, Reactive Forms y PrimeNG.

## Funcionalidad

- Dashboard responsive para escritorio, tablet y mobile.
- Creación de tareas mediante formulario y Enter.
- Validación de títulos vacíos o compuestos solo por espacios.
- Completar y descompletar tareas con estado de actualización individual.
- Edición de título, categoría, prioridad y fecha límite desde el menú de cada card.
- Borrado lógico desde el menú de cada card.
- Papelera en modal con restauración de tareas.
- Fecha límite con PrimeNG DatePicker.
- Filtros por estado y categoría.
- Búsqueda por título.
- Ordenamiento por fecha límite, prioridad o fecha de creación.
- Métricas de total, completadas, pendientes y progreso.
- Estados de carga, error y lista vacía.
- Login, registro, restauración de sesión y logout.
- Sesión mediante cookie `HttpOnly` administrada por el backend.
- Interfaz mobile con navegación inferior y popover de usuario.

La API local utiliza `http://localhost:3000/api`. El interceptor HTTP envía `withCredentials: true` para que el navegador incluya la cookie `iris_auth`.

## Arquitectura

La aplicación utiliza componentes standalone con `ChangeDetectionStrategy.OnPush` y Signals para el estado local y derivado.

```text
src/app/
├── pages/
│   ├── login/
│   ├── register/
│   └── task-dashboard/
│       ├── task-dashboard.ts
│       ├── task-filters/
│       ├── task-form/
│       ├── task-list/
│       ├── task-metrics/
│       ├── task-create-drawer/
│       ├── task-edit-dialog/
│       └── task-trash-dialog/
├── services/
│   ├── auth/                 # API auth, guard, interceptor y sesión
│   └── task/                 # API, mapper y estado de tareas
├── models/                   # Modelos de dominio y DTOs
└── shared/                   # Alertas, iconos, spinner y navegación
```

La ruta `/tasks` usa `authGuard` y renderizado client-side para restaurar la cookie del navegador después de un refresh. Las rutas públicas son `/login` y `/register`.

## Desarrollo local

```bash
pnpm install
pnpm start
```

Abrir `http://localhost:4200/login` y tener el API ejecutándose en `http://localhost:3000`.

## Build y pruebas

```bash
pnpm build
pnpm test
pnpm test:coverage
```

Las pruebas están colocadas junto a los servicios y componentes que verifican. La cobertura actual se reporta con Vitest/V8 y cubre servicios de autenticación y tareas, guards, interceptor, formularios, filtros, lista, métricas y componentes compartidos.

## Environments

La configuración se encuentra en `src/environments/` e incluye únicamente el indicador de producción y la URL pública de la API. No se incluyen secretos porque estos archivos forman parte del bundle público del navegador.

- Desarrollo: `http://localhost:3000/api`.
- Producción: reemplazar `apiUrl` por la URL pública real del backend.
