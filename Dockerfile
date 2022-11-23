FROM node:18-alpine

WORKDIR /app

COPY package.json .
COPY yarn.lock .

# Install dependencies
RUN yarn install --frozen-lockfile --production

# Add required assets
COPY views views
COPY app.js app.js
COPY readfile.js readfile.js
COPY data.json data.json

EXPOSE 8080

CMD ["yarn", "start"]
