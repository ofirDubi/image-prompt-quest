FROM node:20-slim AS base

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Env variables - probably don't need this - but i need to add replicate key here maybe
ARG TABLE_NAME
ARG RECAPTCHA_SECRET
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ARG NEXT_PUBLIC_PLANNER_ID
ARG MAILING_LIST_ENDPOINT
ARG MAILING_LIST_PASSWORD

RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

ARG HOSTNAME

# Start the application
CMD ["npx", "vite", "preview"]


# CMD node server.js