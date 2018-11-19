const router = require('express').Router()
const MongoDate = require('./lib/MongoDate')
const MongoDateRangeBuilder = require('./lib/MongoDateRangeBuilder')
const config = require('./config')

router.get('/', (req, res) => {
  res.json({
    result: 'OK',
  })
})

router.get('/overview', async (req, res) => {
  const db = req.app.locals.db
  const floor = new MongoDate(config.dates.floor).startOf('day')
  const ceil = new MongoDate(config.dates.ceil).endOf('day')
  let dateString = config.dates.now

  // TODO: move from query to param
  if (Object.keys(req.query).length && req.query.date) dateString = req.query.date

  const dayRange = new MongoDateRangeBuilder({ floor, ceil })
    .dayOf(dateString)
    .build()

  const dayPurchases = await db.collection('purchases')
    .find(dayRange.toQuery())
    .toArray()

  const dayUsers = dayPurchases.reduce((acc, val) => {
    if (acc.indexOf(val.user) < 0) acc.push(val.user)
    return acc
  }, [])


  // TODO: cache week and months purchase stats to app.locals
  const weekRange = new MongoDateRangeBuilder({ floor, ceil })
    .weekOf(dateString)
    .build()

  const weekPurchases = await db.collection('purchases')
    .find(weekRange.toQuery())
    .toArray()

  const weekUsers = weekPurchases.reduce((acc, val) => {
    if (acc.indexOf(val.user) < 0) acc.push(val.user)
    return acc
  }, [])


  const monthRange = new MongoDateRangeBuilder({ floor, ceil })
    .monthOf(dateString)
    .build()

  const monthPurchases = await db.collection('purchases')
    .find(monthRange.toQuery())
    .toArray()

  const monthUsers = monthPurchases.reduce((acc, val) => {
    if (acc.indexOf(val.user) < 0) acc.push(val.user)
    return acc
  }, [])

  // TODO: active and inactive users stat, cache it for days, weeks and month

  res.status(200).json({
    numDayPurchases: dayPurchases.length,
    numDayUsers: dayUsers.length,
    numWeekPurchases: weekPurchases.length,
    numWeekUsers: weekUsers.length,
    numMonthPurchases: monthPurchases.length,
    numMonthUsers: monthUsers.length,
  })

})

module.exports = router
