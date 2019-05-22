FROM node:10.15.3-alpine

ADD . /ms-reportjs

WORKDIR /ms-reportjs

RUN npm install --no-optional

EXPOSE 7890

CMD ["npm","run","clear:files"]
CMD ["npm","run","start"]

