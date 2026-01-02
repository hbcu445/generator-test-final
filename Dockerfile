FROM node:22-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm@10.4.1
RUN pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Build the frontend
RUN pnpm build

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
