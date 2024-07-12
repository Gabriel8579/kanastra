# API de processamento de CSV para guardar boletos

## Configuração do ambiente
Em data/charging crie o seguinte arquivo `.env`
```ini
DATABASE_URL="postgresql://kanastra:kanastra@host.docker.internal:5432/kanastra"
REDIS_HOST="host.docker.internal"
REDIS_PORT=6379
```

Em data/cobranca crie o seguinte arquivo `.env`
```ini
REDIS_HOST="host.docker.internal"
REDIS_PORT=6379
```

Feito as configurações basta iniciar com o comando `docker-compose up -d`


## Dica

Para facilitar os testes foi criado um swagger para testar as rotas, basta acessar `http://localhost:3000/api`

# Funcionamento resumido

1. O usuário faz o upload do arquivo CSV com os boletos utilizando a rota `POST /billing/charge` com o arquivo em `multipart/form-data` no campo `file`. Obs: não foi realizado controle de acessos para simplificar
2. O arquivo é convertido para um formato JSON e processado em lote, onde a cada 500 registros é enviado para a fila de processamento
3. O processamento é feito em paralelo, onde cada registro é processado individualmente (simulando um processamento pesado), no projeto de exemplo foram deixados 2 workers para processamento porém pode ser facilmente alterado para aumentar a quantidade de workers
4. Após o processamento o registro é salvo no banco de dados e o status é atualizado

# Técnologias utilizadas
- NestJS
- Prisma
- Bull (filas)
- Redis (cache e filas)
- Docker
- PostgreSQL
- Jest (testes)