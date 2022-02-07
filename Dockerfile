# Deboian Container mit Node.js
FROM node:16

WORKDIR /usr/src/app

# Requirements
COPY package*.json .

RUN npm install

# Kopiert Files in Workdir
COPY ./src .

#Freigeben von Ports
EXPOSE 8080

# Startbefehl
CMD ["node", "index.js"]