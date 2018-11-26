const express = require('express')
const MongoClient = require('mongodb').MongoClient
const router = require('./router')

const port = process.env.PORT || 3000
const mongoUri = 'mongodb://localhost'

let dbClient

const app = express()

app.use(express.static('public'))
app.use('/api', router)

MongoClient
  .connect(mongoUri, {useNewUrlParser: true})
  .then(client => {
    dbClient = client
    app.locals.db = client.db('test')
    app.locals.cache = {
      stats: {},
      activities: {},
    }
    app.listen(port, () => console.info(`Listening on ${port}`))
  })
  .catch(error => console.error(error))
;

process.on('SIGINT', () => {
  dbClient.close()
  process.exit()
})
