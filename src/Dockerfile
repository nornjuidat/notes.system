FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy app source
COPY . .

# App port
EXPOSE 3000

# Start app
CMD ["node", "server.js"]
