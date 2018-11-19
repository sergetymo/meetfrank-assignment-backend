const MongoDate = require('./MongoDate')
const MongoDateRangeBuilder = require('./MongoDateRangeBuilder')
const Stat = require('./Stat')
const config = require('../config')

class CachedStatSet {
  constructor(date, cache, db) {
    const floor = new MongoDate(config.dates.floor).startOf('day')
    const ceil = new MongoDate(config.dates.ceil).endOf('day')
    const today = new MongoDate(config.dates.today)

    this._date = new MongoDate(date)
    this._db = db
    this._cache = cache
    this._ranges = {}
    this._stats = {}

    config.ranges.forEach(range => {
      this._ranges[range] = new MongoDateRangeBuilder({ floor, ceil })
        .rangeOf(range, date)
        .build()
    })

    if (config.isTillTodayAllowed && !this._date.isSameDayAs(today)) {
      this._ranges['tilltoday'] = new MongoDateRangeBuilder({ floor, ceil })
        .from(this._date)
        .to(today)
        .build()
    }
  }

  async getStats() {
    if (Object.keys(this._stats).length > 0) return this._stats
    for (let range in this._ranges) {
      const key = this._ranges[range].toCacheKey() 
      if (this._cache[key] && Object.keys(this._cache[key]).length > 0) {
        this._stats[range] = this._cache[key]
      } else {
        const purchases = await this._db
          .collection('purchases')
          .find(this._ranges[range].toQuery())
          .toArray()
        const stat = new Stat(purchases)
        this._stats[range] = stat.toQuantity()
        this._cache[key] = stat.toQuantity()
      }
    }
    return this._stats
  }
  
}

module.exports = CachedStatSet