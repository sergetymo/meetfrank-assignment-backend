const MongoDate = require('./MongoDate')
const MongoDateRangeBuilder = require('./MongoDateRangeBuilder')
const config = require('../config')

class CachedActivitySet {
  // TODO: Create CachedSet superclass
  constructor(date, cache, db) {
    const floor = new MongoDate(config.dates.floor).startOf('day')
    const ceil = new MongoDate(config.dates.ceil).endOf('day')
    const today = new MongoDate(config.dates.today)

    this._date = new MongoDate(date)
    this._db = db
    this._cache = cache

    this._activities = {}

    this._activeRange = new MongoDateRangeBuilder({ floor, ceil })
      .duration(config.activitySettings.activeDuration)
      .to(this._date)
      .build()

    this._churnEnd = this._date.subtract(config.activitySettings.churnDelay)
    this._churnStart = this._churnEnd.subtract(config.activitySettings.churnDuration)

    this._churnRange = new MongoDateRangeBuilder({ floor, ceil })
      .from(this._churnStart)
      .to(this._date)
      .build()
  }

  async getActivities() {
    if (Object.keys(this._activities).length > 0) return this._activities
    const key = this._date.toDayString()
    if (this._cache[key] && Object.keys(this._cache[key] > 0)) {
      this._activities = this._cache[key]
    } else {
      this._activities = {
        active: await this._getActive(),
        churned: await this._getChurned(),
        inactive: await this._getInactive(),
      }
    }
    this._cache[key] = this._activities
    console.log('--')
    console.log(this._cache)
    return this._activities
  }

  async _getActive() {
    const data = await this._db
      .collection('purchases')
      .aggregate([
        { $match: this._activeRange.toQuery() },
        { $group: { _id: '$user', count: { $sum: 1 } } },
        { $match: { count: { $gte: config.activitySettings.activePurchases } } },
        { $count: 'count' },
      ]).toArray()
    return data.length > 0 ? data[0].count : 0
  }

  async _getChurned() {
    const data = await this._db
      .collection('purchases')
      .aggregate([
        { $match: this._churnRange.toQuery() },
        { $group: { _id: '$user', last_purchase: { $max: "$_id" } } },
        { $match: { last_purchase: { $lt: this._churnEnd.toObjectId() } } },
        { $count: 'count' },
      ]).toArray()
    return data.length > 0 ? data[0].count : 0
  }

  async _getInactive() {
    const data = await this._db
      .collection('purchases')
      .aggregate([
        { $match: { _id: { $lt: this._date.toObjectId()} } },
        { $group: { _id: '$user', last_purchase: { $max: "$_id" } } },
        { $match: { last_purchase: { $lt: this._churnStart.toObjectId() } } },
        { $count: 'count' },
      ]).toArray()
    return data.length > 0 ? data[0].count : 0
  }
}

module.exports = CachedActivitySet
