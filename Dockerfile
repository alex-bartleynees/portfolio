FROM node:lts-bullseye AS build

# Set working directory
WORKDIR /app

# Copy "package.json" and "package-lock.json" before other files
COPY package.json package-lock.json ./

RUN npm ci
COPY . /app
RUN npm run build

FROM node:lts-alpine
WORKDIR /app
ENV HOST=0.0.0.0
ENV PORT=4321

# Copy package files
COPY package.json package-lock.json ./
# Install production dependencies only
RUN npm ci --omit-dev

# Copy build output
COPY --from=build /app/dist ./dist
COPY --from=build /app/run-server.js ./

CMD ["node", "./run-server.js"]
EXPOSE 4321
