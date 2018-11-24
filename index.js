const app = require('express')()
const MongoClient = require('mongodb').MongoClient
const port = process.env.PORT || 3002 
const mongoUri = 'mongodb://localhost'

const router = require('./router')

let dbClient

app.use('/api', router)

app.get('/', (req, res) => 
  // TODO: join two repos and serve static form here
  res.send('Hello World')
)

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