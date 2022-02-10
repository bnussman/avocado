FROM node:current-alpine

WORKDIR /usr/api

COPY api/ . 

RUN npm install

RUN npx tsc

EXPOSE 3001

CMD [ "node", "build/index.js" ]

