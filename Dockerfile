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

# Create dist/index.js entry point after build
RUN echo "import { fileURLToPath } from 'url';" > dist/index.js && \
    echo "import { dirname, join } from 'path';" >> dist/index.js && \
    echo "const __filename = fileURLToPath(import.meta.url);" >> dist/index.js && \
    echo "const __dirname = dirname(__filename);" >> dist/index.js && \
    echo "await import(join(__dirname, '..', 'server.js'));" >> dist/index.js

# Expose port
EXPOSE 3000

# Start the server via dist/index.js
CMD ["node", "dist/index.js"]
