FROM node:8-alpine
MAINTAINER Sascha Gros <sascha.gros@quellcodefabrik.com>

WORKDIR /usr/app
VOLUME ['/usr/app']

# copy all project files into docker container
COPY . .

# install dependencies and compile typescript files
RUN npm install -g typescript@2.7.2 --quiet && \
    npm install && \
    tsc

# set a health check
HEALTHCHECK --interval=5s \
            --timeout=5s \
            CMD curl -f http://127.0.0.1:8000 || exit 1

EXPOSE 8000

CMD node server