# PruebaTecnicaAnalistaDeSistemas2-

ICRI – Sistema de Gestión de Evidencias
Backend (Node/Express), Frontend (React/Vite), Docker, PostgreSQL

📌 Descripción
Aplicación para la Dirección de Investigación Criminalística (DICRI) del Ministerio Público de Guatemala que permite registrar, revisar y aprobar expedientes e indicios, además de emitir reportes con filtros por fecha y estado. Incluye autenticación con roles (Técnico, Coordinador, Administrador) y despliegue con Docker.

🎯 Alcance funcional
Gestión de expedientes DICRI: datos generales, fecha de registro, técnico que registra.

Gestión de indicios: descripción, color, tamaño, peso, ubicación, técnico.

Flujo de revisión:

Técnicos cargan los indicios.

Coordinador aprueba o rechaza el expediente (con justificación en caso de rechazo).

Estado final: Aprobado.

Reportes: registros, aprobaciones y rechazos con filtros por fecha y estado.

Seguridad: autenticación y control de permisos por rol.

🧱 Arquitectura (visión rápida)
Frontend: React + Vite + (Chakra UI opcional).

Backend: Node.js + Express + Prisma (o Sequelize) + JWT.

BD: PostgreSQL.

Infra: Docker Compose (servicios frontend, api, db), red interna y volúmenes.

Documentación de API: Swagger/OpenAPI en /docs.


# Primera vez / después de cambios en Dockerfile
docker compose build

# Levantar todo
docker compose up
# o en segundo plano
docker compose up -d


$net = (docker inspect -f '{{range $k,$v := .NetworkSettings.Networks}}{{printf "%s" $k}}{{end}}' sqlserver)
docker run --rm --network $net mcr.microsoft.com/mssql-tools `
  /opt/mssql-tools/bin/sqlcmd -S db -U sa -P "Luis1423" `
  -Q "CREATE DATABASE [PruebaTecnicaDB];"


Backend
cd api
cp ../.env .env         # o configura variables equivalentes
npm install
npx prisma migrate dev  # o sequelize db:migrate
npm run dev



Frontend
cd frontend
cp ../.env .env
npm install
npm run dev


Autenticación y Autorización
JWT: /auth/login devuelve accessToken.

Roles:

TECNICO: crea/edita expedientes (en registro) e indicios propios.

COORDINADOR: revisa, aprueba/rechaza con justificación.

ADMIN: puede listar usuarios, cambiar roles, ver reportes globales.

Middlewares: auth, requireRole(...), rate limit básico.

🔌 API (resumen)
Documentada en Swagger (/docs). Rutas típicas:

Auth

POST /auth/login → { accessToken }

Usuarios

GET /usuarios/me

Expedientes

POST /expedientes

GET /expedientes?estado=&fechaInicio=&fechaFin=

GET /expedientes/:id

POST /expedientes/:id/enviar-a-revision

POST /expedientes/:id/aprobar

POST /expedientes/:id/rechazar (body: justificacion)

Indicios

POST /expedientes/:id/indicios

PUT /indicios/:id

DELETE /indicios/:id

Reportes

GET /reportes/resumen?desde=&hasta=&estado=

🧪 Pruebas
Backend: Jest/Supertest (npm run test), cobertura crítica: auth, permisos, flujo aprobar/rechazar.

Frontend: Vitest + React Testing Library (npm run test