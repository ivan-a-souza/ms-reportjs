FROM node:10.15.3-alpine

ADD . /ms-reportjs

WORKDIR /ms-reportjs

RUN npm install --no-optional

CMD ["npm","start"]