FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY .env ./.env
RUN npx prisma generate || true

RUN npx --yes nodemon --version >/dev/null 2>&1 || true

# copia todo (incluye docker/ y sql/)
COPY . .
RUN chmod +x ./docker/entrypoint.sh

EXPOSE 4000
ENTRYPOINT ["sh","/app/docker/entrypoint.sh"]
