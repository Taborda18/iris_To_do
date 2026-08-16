# IRIS To-Do API

Backend REST construido con Express 5, TypeScript, Prisma 6 y MongoDB Atlas.

## Instalación

```bash
pnpm install
copy .env.example .env
pnpm prisma:generate
pnpm prisma:push
pnpm dev
```

Configura `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN` y `CORS_ORIGIN` en `.env`. Nunca subas `.env` ni credenciales reales al repositorio.

Después de actualizar `prisma/schema.prisma`, sincroniza el esquema con:

```bash
pnpm prisma:generate
pnpm prisma:push
```

Al iniciar, la API crea el índice TTL `tasks_deletedAt_ttl` sobre `deletedAt`. Este índice elimina automáticamente las tareas que permanecen en papelera durante 14 días (`1209600` segundos). Puedes comprobarlo en MongoDB Atlas en `iris_todo > tasks > Indexes`.

## Autenticación

El registro y login emiten la cookie `iris_auth` con los atributos `HttpOnly`, `SameSite=Lax` y `Secure` en producción. El frontend debe enviar las peticiones con credenciales (`withCredentials: true`).

El API valida la firma del JWT y obtiene el usuario desde el claim `sub`. El `userId` no se recibe desde el cliente para consultar tareas: se deriva exclusivamente de la sesión verificada.

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

## Endpoints de tareas

Todos requieren una cookie `iris_auth` válida. Las tareas contienen `title`, `category`, `priority`, `completed`, `visible`, `dateLimit`, `deletedAt`, `createdAt` y `updatedAt`. Las categorías válidas son `FrontEnd`, `BackEnd` y `Docs`; las prioridades son `Baja`, `Media` y `Urgente`.

```text
GET    /api/tasks?completed=true&page=1&limit=20
GET    /api/tasks?visible=false&page=1&limit=20
GET    /api/tasks/:id
POST   /api/tasks
PATCH  /api/tasks/:id
DELETE /api/tasks/:id
POST   /api/tasks/:id/restore
```

`GET /api/tasks` muestra tareas visibles por defecto y soporta filtros por estado, visibilidad y paginación. Usa `visible=false` para consultar la papelera.

`DELETE /api/tasks/:id` realiza un borrado lógico: establece `visible=false` y guarda la fecha actual en `deletedAt`. `POST /api/tasks/:id/restore` restaura la tarea estableciendo `visible=true` y `deletedAt=null`. Si permanece en papelera durante 14 días, el índice TTL de MongoDB la elimina definitivamente.

`dateLimit` es opcional y debe enviarse como fecha en formato `YYYY-MM-DD`, por ejemplo `2026-08-19`. Todas las operaciones aplican el `userId` autenticado, por lo que un usuario no puede leer, actualizar, restaurar o eliminar tareas de otro.

## Documentación de API

La documentación interactiva de Scalar está disponible en:

```text
http://localhost:3000/docs
```

El contrato OpenAPI está disponible en:

```text
http://localhost:3000/openapi.json
```

La colección de Postman se encuentra en `postman/iris-todo.postman_collection.json`. Ejecuta Register o Login primero; Postman conservará automáticamente la cookie de sesión.

## Arquitectura

El backend implementa Clean Architecture con una organización modular por dominios funcionales como `auth` y `tasks`:

```text
src/
├── modules/
│   ├── auth/
│   │   ├── domain/             # Entidades y puertos
│   │   ├── application/        # Casos de uso
│   │   ├── infrastructure/     # JWT, bcrypt y Prisma
│   │   └── interfaces/         # Controllers, schemas, routes y cookies
│   └── tasks/
│       ├── domain/
│       ├── application/
│       ├── infrastructure/
│       └── interfaces/
├── interfaces/http/            # Middleware HTTP transversal
├── shared/                     # Errores compartidos
└── app.ts                      # Composition root
```

Cada módulo separa:

- `domain`: entidades e interfaces.
- `application`: casos de uso y reglas de aplicación.
- `infrastructure`: implementaciones concretas como Prisma, JWT y bcrypt.
- `interfaces`: controllers, schemas, rutas y cookies.

Las reglas de negocio no dependen de Express, Prisma ni MongoDB. `app.ts` actúa como composition root y conecta las implementaciones concretas con los casos de uso. Las pruebas unitarias sustituyen esos puertos por fakes.

## Seguridad y resiliencia

- JWT firmado y con expiración configurable.
- Cookie `HttpOnly` para evitar acceso del token desde JavaScript.
- `SameSite=Lax` y `Secure` en producción.
- CORS restringido al origen configurado.
- Helmet para headers de seguridad.
- Rate limiting global.
- Validación estricta de body y query con Zod.
- Errores centralizados con formato `{ error: { code, message, details } }`.
- Índices MongoDB para `userId`, `completed`, `createdAt` y combinaciones de consulta.
- Índice TTL `tasks_deletedAt_ttl` para eliminar tareas de papelera después de 14 días.
- Paginación para limitar el tamaño de las respuestas.
- API stateless: cualquier instancia puede validar la sesión con el mismo secreto.

Ante crecimiento de tráfico, el API puede escalar horizontalmente detrás de un balanceador. MongoDB conserva los datos y sus índices, mientras el rate limiting y la paginación evitan solicitudes y respuestas desproporcionadas.

## Verificación

```bash
pnpm build
pnpm test
pnpm test:coverage
```

Las pruebas unitarias están en `tests/unit/` y utilizan fakes para aislar los casos de uso, middleware, schemas y adaptadores verificables sin base de datos. La cobertura se enfoca en la lógica de negocio y las fronteras unit-testables; el composition root, las rutas Express y los adaptadores Prisma quedan fuera del alcance unitario.
