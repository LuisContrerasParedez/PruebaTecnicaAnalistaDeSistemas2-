# backend/Dockerfile
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci


COPY prisma ./prisma
COPY .env ./.env
RUN npx prisma generate || true

RUN npx --yes nodemon --version >/dev/null 2>&1 || true

COPY . .
EXPOSE 4000
CMD ["npm","run","dev"]
