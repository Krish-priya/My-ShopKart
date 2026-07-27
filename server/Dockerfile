FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 5000

CMD ["sh", "-c", "node scripts/setupDatabase.js && node scripts/migrateRazorpayReviews.js; node server.js"]
