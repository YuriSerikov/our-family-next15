FROM node:current-alpine3.22

ENV NODE_ENV=production
ARG APP_DIR=app
WORKDIR ${APP_DIR}

COPY package*.json .
# Если вы создаете сборку для продакшн
RUN npm ci --only=production

#RUN npm run client:build
# Удаление папки с npm-модулями
#RUN rm -rf node_modules
COPY . .

EXPOSE 5501

CMD [ "node", "build/main.js" ]
