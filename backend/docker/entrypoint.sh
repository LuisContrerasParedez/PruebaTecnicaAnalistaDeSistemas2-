#!/bin/sh
set -e

echo " Prisma generate..."
npx prisma generate

echo "  Ejecutando migrations..."
if ! npx prisma migrate deploy; then
  echo "  migrate deploy falló; usando prisma db push (DEV)"
  npx prisma db push
fi

echo "📜 Cargando Stored Procedures"
FOUND=0
for DIR in "./sql" "./prisma/sql" "./Prisma/sql"; do
  if [ -d "$DIR" ] && ls -1 "$DIR"/*.sql >/dev/null 2>&1; then
    echo "   → Encontrado: $DIR"
    for f in "$DIR"/*.sql; do
      echo "     Ejecutando: $f"
      npx prisma db execute --file "$f" --schema ./prisma/schema.prisma || echo "⚠️ Falló $f (continuando)"
    done
    FOUND=1
  fi
done
[ "$FOUND" = "0" ] && echo "⚠️  No se encontraron .sql en ./sql ni ./prisma/sql"
exec npm run dev
