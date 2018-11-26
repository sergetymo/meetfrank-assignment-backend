const router = require('express').Router()
const MongoDate = require('./lib/MongoDate')
const CachedStatSet = require('./lib/CachedStatSet')
const CachedActivitySet = require('./lib/CachedActivitySet')
const config = require('./config')

router.get('/', (req, res) => {
  res.status(200).json({
    result: 'OK',
  })
})

router.get('/stats', async (req, res) => {
  const cache = req.app.locals.cache
  const db = req.app.locals.db
  let date = config.dates.today

  if (Object.keys(req.query).length && req.query.date) {
    const mDate = new MongoDate(req.query.date)
    if (mDate.isBefore(new MongoDate(config.dates.floor))) {
      date = config.dates.floor
    }
    if (mDate.isAfter(new MongoDate(config.dates.ceil))) {
      date = config.dates.ceil
    }
  }


  try {
    const statSet = new CachedStatSet(date, cache.stats, db)
    const activitySet = new CachedActivitySet(date, cache.activities, db)
    const stats = await statSet.getStats()
    const activities = await activitySet.getActivities()
    res.status(200).json({
      result: 'OK',
      data: {
        dates: {
          min: config.dates.floor,
          max: config.dates.ceil,
          today: config.dates.today,
          current: date,
        },
        stats,
        activities,
      },
      message: ''
    })
  } catch (e) {
    res.status(500).json({
      error: {
        code: 500,
        message: e.message
      }
    })
  }
})

module.exports = router
