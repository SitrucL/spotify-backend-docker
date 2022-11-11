FROM node:16

# Create app directory
WORKDIR /app
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY . ./

RUN npm install

# Bundle app source
COPY . .

ENV PORT=8080

RUN npm run build

CMD [ "npm", "run", "start" ]