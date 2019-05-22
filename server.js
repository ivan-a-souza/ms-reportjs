const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const fs = require('fs')

const request = require('request')
const xl = require('excel4node')
const uniqid = require('uniqid')

const port = 7890

const app = express()

app.use(morgan('combined'))

app.use(bodyParser.json({
  limit: "50mb"
}))

app.get('/api/example/collection', (req, res) => {
  const readStream = fs.createReadStream("./example-collection.json")

  readStream.on('error', (err) => {
    res.status(500).send(JSON.stringify(err.stack))
  })

  res.contentType('application/json')
  res.status(200)

  readStream.pipe(res)
})

app.get('/xlsx/:xlsId', (req, res) => {
  const xlsId = req.params.xlsId
  const fileName = xlsId
  const filePath = __dirname.concat('/files/').concat(fileName).concat('.xlsx')

  fs.access(filePath, fs.F_OK, (err) => {
    if (err) {
      return res.status(404).end()
    }

    const readStream = fs.createReadStream(filePath)

    readStream.on('error', (err) => {
      res.status(500).send(JSON.stringify(err.stack))
    })

    res.set('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.status(200)

    readStream.pipe(res)
  })
})

app.post('/xlsx', (req, res) => {
  const fileName = uniqid()
  const worksheet = req.body.worksheets[0]

  const wb = new xl.Workbook()

  let data = [];
  request
    .get(worksheet.dataSource, { json: true })
    .on('data', (chunk) => {
      data.push(chunk)
    })
    .on('end', () => {
      const rows = JSON.parse(data.toString())

      const ws = wb.addWorksheet(worksheet.title)

      let line = 1

      if (worksheet.heading) {
        worksheet.heading.forEach((value, index) => {
          let column = index + 1
          switch (typeof value) {
            case "number":
              ws.cell(line, column).number(value)
              break
            case "boolean":
              ws.cell(line, column).bool(value)
              break
            case "string":
              ws.cell(line, column).string(value)
              break
          }
        })
        line++
      }

      rows.forEach((row, index) => {
        Object.keys(row).forEach((item, key) => {
          let column = key + 1
          let value = row[item]

          switch (typeof value) {
            case "number":
              ws.cell(line, column).number(value)
              break
            case "boolean":
              ws.cell(line, column).bool(value)
              break
            case "string":
              ws.cell(line, column).string(value)
              break
          }
        })
        line++
      })

      wb.write('files/' + fileName + ".xlsx")
    })

  var reportUrl = req.protocol + '://' + req.get('host') + req.originalUrl + '/' + fileName

  res.header('Location', reportUrl)
  res.status(202).send()
})

app.listen(port, () => console.log(`MS ReportJS listening on port ${port}!`))