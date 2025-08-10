# PruebaTecnicaAnalistaDeSistemas2-


$net = (docker inspect -f '{{range $k,$v := .NetworkSettings.Networks}}{{printf "%s" $k}}{{end}}' sqlserver)
docker run --rm --network $net mcr.microsoft.com/mssql-tools `
  /opt/mssql-tools/bin/sqlcmd -S db -U sa -P "Luis1423" `
  -Q "CREATE DATABASE [PruebaTecnicaDB];"


