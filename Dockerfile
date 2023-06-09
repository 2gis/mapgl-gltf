FROM node:16

USER root
RUN apt-get -qq update && \
    apt-get -qq install gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 \
    libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 \
    libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 \
    libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 \
    libnss3 lsb-release xdg-utils wget libgbm1 > /dev/null


RUN mkdir /mapgl-gltf

RUN adduser ubuntu
RUN chown ubuntu:ubuntu /mapgl-gltf

WORKDIR /mapgl-gltf

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

RUN npm cache clean --force
RUN npm ci

COPY --chown=ubuntu:ubuntu . .
USER ubuntu

