#! /bin/sh

# run migration prisma

yarn prisma migrate deploy

# run the server
node dist/main.js