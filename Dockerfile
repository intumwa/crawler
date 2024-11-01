# Dockerfile

FROM mcr.microsoft.com/playwright:v1.48.2-focal

WORKDIR /usr/app

COPY package*.json ./

RUN npm install

COPY . .

# Copy wait-for-it.sh into the image
COPY wait-for-it.sh /usr/app/wait-for-it.sh
RUN chmod +x /usr/app/wait-for-it.sh

CMD ["./wait-for-it.sh", "mysql_db:3306", "--timeout=60", "--", "node", "app.js"]
