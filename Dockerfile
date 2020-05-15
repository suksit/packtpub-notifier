FROM node:14-alpine

WORKDIR /app

RUN apk add --no-cache chromium ttf-freefont tzdata \
    && cp /usr/share/zoneinfo/Asia/Bangkok /etc/localtime \
    && echo "Asia/Bangkok" > /etc/timezone \
    && echo '00 11 * * * cd /app; node index.js' > crontab.tmp \
    && crontab crontab.tmp \
    && rm -f crontab.tmp

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

COPY package.json .
RUN yarn --prod

COPY index.js config.json ./

CMD ["/usr/sbin/crond", "-f", "-l", "8"]
