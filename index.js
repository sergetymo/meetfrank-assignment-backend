const app = require('express')()
const MongoClient = require('mongodb').MongoClient
const port = process.env.PORT || 3002 
const mongoUri = 'mongodb://localhost'

const router = require('./router')

let dbClient

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://kenneth.local:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  next();
});

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