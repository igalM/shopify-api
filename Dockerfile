FROM node:10-alpine

RUN mkdir -p /app

WORKDIR /app

COPY package*.json /app/

RUN npm install 
RUN npm install -g typescript

COPY . /app/

EXPOSE 3000

CMD ["npm", "start"]