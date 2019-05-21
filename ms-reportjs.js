const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const xl = require('excel4node');
const port = 7890;

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname + '/'));

app.get('/', (req, res) => {
  res.write('Hello!');
})

app.get('/xlsx', (req, res) => {
  let data = [];
  request
    .get('http://localhost:7890/data.json', { json: true })
    .on('data', (chunk) => {
      data.push(chunk);      
    })
    .on('response', (response) => {
      console.log(response.statusCode);
      console.log(response.headers['content-type']);
    })
    .on('end', () => {
      const report = JSON.parse(data);

      var wb = new xl.Workbook();

      var ws = wb.addWorksheet(report.title);

      report.rows.forEach((row, index)  => {
        let line = index + 1;
        Object.keys(row).forEach((item, key) => {
          let column = key + 1;
          let value = row[item];

          switch(typeof value) {
            case "number":
              ws.cell(line, column).number(value);  
              break;
            case "boolean":
              ws.cell(line, column).bool(value);  
              break;
            case "string":
              ws.cell(line, column).string(value);  
              break;
          }
        });           
      });

      wb.write(report.fileName, res);
    });
});

//create app server and listen on port
app.listen(port, () => console.log(`App listening on port ${port}!`))