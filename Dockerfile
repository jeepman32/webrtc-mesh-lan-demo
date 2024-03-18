# syntax=docker/dockerfile:1.4

FROM node:lts-buster-slim AS development

# Create app directory
WORKDIR /usr/src/app

COPY package.json /usr/src/app/package.json
COPY pnpm-lock.yaml /usr/src/app/pnpm-lock.yaml
# Very purposefully use system node_modules. We don't need to reinstall them on the image.
COPY . .

CMD [ "npm", "run", "dev" ]
