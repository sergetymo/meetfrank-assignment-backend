const router = require('express').Router()
const MongoDate = require('./lib/MongoDate')
const MongoDateRangeBuilder = require('./lib/MongoDateRangeBuilder')
const CachedStatSet = require('./lib/CachedStatSet')
const config = require('./config')

router.get('/', (req, res) => {
  res.json({
    result: 'OK',
  })
})

router.get('/stats', async (req, res) => {
  const cache = req.app.locals.cache.stats
  const db = req.app.locals.db
  let date = config.dates.today
  // TODO: move from query to param
  if (Object.keys(req.query).length && req.query.date) date = req.query.date
  const statSet = new CachedStatSet(date, cache, db)
  const stats = await statSet.getStats()
  res.status(200).json({
    result: 'OK',
    date: date,
    stats,
  })
})

module.exports = router
