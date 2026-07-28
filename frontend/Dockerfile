FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Set API URL for Next.js API routes (PostgreSQL backend)
ENV NEXT_PUBLIC_API_URL=http://localhost:3000/api

RUN npm run build

EXPOSE 3000

# Start Next.js on port 3000
CMD ["npm", "run", "start", "--", "-p", "3000"]
