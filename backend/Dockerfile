FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

# Install dependencies including devDependencies to compile TS
RUN npm install

COPY . .

RUN npm run build

EXPOSE 10001

CMD ["npm", "start"]
