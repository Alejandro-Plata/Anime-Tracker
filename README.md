# AnimeWatch Tracker

Aplicación web para **buscar anime y llevar el seguimiento personal**: cada usuario guarda sus favoritos, les asigna un estado y una puntuación, y consulta los detalles y reseñas de cada título. Los datos de los animes vienen de la [API Jikan](https://jikan.moe/) (MyAnimeList); la lista personal se guarda en PostgreSQL.

| Carpeta | Qué es | Tecnologías |
|---|---|---|
| [`frontend`](./frontend) | Cliente web | Angular 20, TypeScript |
| [`backend`](./backend) | API REST | Node.js, Express 5, TypeScript, Sequelize, PostgreSQL, JWT, bcrypt, express-validator, rate limiting |

```
┌──────────────┐  Jikan API (catálogo de anime)
│   frontend   │ ──────────────────────────────►
│ Angular :4200│
│              │  HTTP + JWT   ┌─────────────┐  Sequelize  ┌────────────┐
│              │ ────────────► │   backend   │ ──────────► │ PostgreSQL │
└──────────────┘               │ Express:3000│             └────────────┘
                               └─────────────┘
```

## Demo en vivo
| | URL |
|---|---|
| Aplicación web | https://anime-watchtracker.vercel.app |
| API | https://anime-tracker-opal.vercel.app |

Puedes crear una cuenta con cualquier usuario y contraseña para probarla. La primera petición tras un rato sin uso puede tardar unos segundos por el arranque en frío de la función serverless.

## Funcionalidades
- Registro, inicio de sesión (JWT) y recuperación de contraseña con código por e-mail
- Buscador avanzado y sección de descubrimiento
- Detalle de cada anime con reseñas
- Mi lista: favoritos con estado de visionado y puntuación propia

## Arranque en local
Necesitas Node.js 20+ y una base de datos PostgreSQL.

```bash
# Backend (http://localhost:3000)
cd backend
cp .env.example .env      # rellena DATABASE_URL y JWT_SECRET
npm install
npm run dev

# Frontend (http://localhost:4200), en otra terminal
cd frontend
npm install
npm start
```

El frontend usa `http://localhost:3000/api` cuando se abre desde `localhost` y el backend desplegado en cualquier otro dominio (`API_URL` en `frontend/src/app/services/auth-service.ts`). Las tablas se crean solas al arrancar el backend (`sequelize.sync`).

### Variables de entorno del backend
| Variable | Para qué |
|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL (con `?sslmode=require` en Neon, Supabase…) |
| `JWT_SECRET` | Firma de tokens |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | Envío del código de "olvidé mi contraseña". Sin ellas, en local el código se muestra por consola |

## Endpoints principales
| Método | Ruta | Acceso |
|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login`, `/api/auth/logout` | público |
| POST | `/api/auth/forgot-password`, `/api/auth/reset-password` | público |
| GET | `/api/auth/user` | autenticado |
| GET / POST | `/api/user/favorites` | autenticado |
| GET / DELETE | `/api/user/favorites/:animeId` | autenticado |
| PATCH | `/api/user/favorites/:animeId/state`, `/score` | autenticado |
| GET | `/api/user/favorite/check/:animeId` | autenticado |

## Despliegue
Ambas partes se publican en Vercel como proyectos separados: el backend (carpeta `backend`) como función serverless y el frontend (carpeta `frontend`, con su `vercel.json`) como sitio estático. La base de datos está en Neon.
