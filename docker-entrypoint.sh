#!/bin/sh

if [ ! -f "node_modules/.bin/nest" ]; then
  echo "Installing dependencies..."
  npm install
fi

npx prisma generate

exec npm run start:dev