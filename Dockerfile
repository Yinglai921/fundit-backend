FROM node:latest

RUN mkdir /app
WORKDIR /app

COPY . /app
RUN npm install
EXPOSE 3001

CMD ["npm", "start"]