FROM node
LABEL authors="swaggeroo"

EXPOSE 3000

WORKDIR /app

COPY . /app

RUN npm install

ENTRYPOINT ["npm", "start"]