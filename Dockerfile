FROM node:13-alpine

WORKDIR /usr/src/app

COPY package.json .

RUN yarn --prod

COPY index.js config.json ./

RUN apk add --no-cache tzdata \
    && cp /usr/share/zoneinfo/Asia/Bangkok /etc/localtime \
    && echo "Asia/Bangkok" > /etc/timezone \
    && echo '30 7 * * * cd /usr/src/app; node index.js' > crontab.tmp \
    && crontab crontab.tmp \
    && rm -f crontab.tmp

CMD ["/usr/sbin/crond", "-f", "-d", "0"]
