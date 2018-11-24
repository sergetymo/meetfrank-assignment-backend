const router = require('express').Router()
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
  // TODO: move from query to param
  if (Object.keys(req.query).length && req.query.date) date = req.query.date
  try {
    const statSet = new CachedStatSet(date, cache.stats, db)
    const activitySet = new CachedActivitySet(date, cache.activities, db)
    const stats = await statSet.getStats()
    const activities = await activitySet.getActivities()
    res.status(200).json({
      result: 'OK',
      data: {
        date,
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
