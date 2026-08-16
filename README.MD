# Iris To Do App

Este repositorio contiene la solución desarrollada para la prueba técnica de **IRIS** para el cargo de **Development Full-Stack.**

El proyecto consiste en una aplicación Full Stack para la gestión de tareas, compuesta por una API REST y una aplicación web.

## Proyecto

El repositorio se encuentra dividido en dos aplicaciones principales:

### 1. API

Ubicada en:

```text
/api
```

Desarrollada con:

- Node.js
- TypeScript
- Express
- Prisma ORM
- MongoDB
- JWT
- Zod
- Vitest

El backend utiliza **Clean Architecture organizada de forma modular por funcionalidades**, separando dominio, casos de uso, infraestructura e interfaces.

La autenticación se realiza mediante **JWT almacenado en una cookie `HttpOnly`**.

**API desplegada:**  
https://iris-to-do.onrender.com/api

**Documentación:**  
https://iris-to-do.onrender.com/docs

> ⚠️ El backend utiliza una instancia gratuita de Render, por lo que la primera petición después de un periodo de inactividad puede tardar algunos segundos adicionales.

La documentación completa del backend se encuentra en:

[`/api/README.md`](./api/README.md)

---

### 2. Frontend

Ubicado en:

```text
/web-app
```

Desarrollado con:

- Angular 22
- TypeScript
- Standalone Components
- Signals
- Reactive Forms
- PrimeNG

La aplicación consume directamente la API incluida en este repositorio e implementa registro, autenticación, gestión de sesión y administración completa de tareas.

Entre las principales funcionalidades se encuentran:

- Crear, editar y completar tareas.
- Eliminación lógica y papelera.
- Restauración de tareas.
- Categorías y prioridades.
- Fecha límite.
- Búsqueda, filtros y ordenamiento.
- Métricas de progreso.
- Diseño responsive.

**Aplicación desplegada:**  
https://iris-to-do-eight.vercel.app

La documentación completa del frontend se encuentra en:

[`/web-app/README.md`](./web-app/README.md)

## Estructura

```text
iris_To_do/
├── api/
├── web-app/
├── docker-compose.yml
└── README.md
```

## Ejecutar localmente

### API

```bash
cd api
pnpm install
pnpm prisma:generate
pnpm prisma:push
pnpm dev
```

Es necesario configurar previamente las variables de entorno tomando como referencia:

```text
/api/.env.example
```

### Frontend

```bash
cd web-app
pnpm install
pnpm start
```

Por defecto:

```text
Frontend → http://localhost:4200
API      → http://localhost:3000
```

## Docker

También es posible construir y ejecutar los servicios mediante Docker:

```bash
docker compose up --build
```

## Pruebas

Tanto el frontend como el backend cuentan con pruebas automatizadas mediante Vitest.

```bash
pnpm test
```

Para consultar información sobre arquitectura, endpoints, variables de entorno, pruebas y funcionamiento interno, revisar los README incluidos en cada aplicación.

## Notas finales

Agradezco la oportunidad de participar en este proceso y de desarrollar esta prueba técnica.

Independientemente del resultado, agradecería cualquier feedback sobre la solución y las decisiones técnicas implementadas.

**Hecho por Robin Alejandro Taborda Giraldo.**
