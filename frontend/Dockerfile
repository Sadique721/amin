FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Set API URL for static generation bundle
ENV NEXT_PUBLIC_API_URL=http://localhost:10001/api/public

RUN npm run build

EXPOSE 10002

# Start Next.js on port 10002
CMD ["npm", "run", "start", "--", "-p", "10002"]
