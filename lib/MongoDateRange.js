const config = require('../config')

class MongoDateRange {
  /**
   * @param {MongoDate} start
   * @param {MongoDate} end
   * @param {string} [range]
   * @see config.ranges
   */
  constructor(start, end, range) {
    this.start = start
    this.end = end
    this._range = range
  }

  toQuery() {
    return {
      _id: {
        $gte: this.start.toObjectId(),
        $lte: this.end.toObjectId()
      }
    }
  }

  toString() {
    return this.start.toString() + ' - ' + this.end.toString()
  }

  toCacheKey() {
    if (!this._ensureCorrectRange()) throw new Error('MongoDateRange toCacheKey: incorrect range')
    const start = this.start.toDate()
    const end = this.end.toDate()
    switch (this._range) {
      case 'day':
        return 'd' + config.rds + start.toDayString()
      case 'week':
        return 'w' + config.rds + start.toDayString() +
          config.rds + config.rds + end.toDayString()
      case 'month':
        return 'm' + config.rds + start.toMonthString()
    }
  }

  _ensureCorrectRange() {
    return !!this._range &&
      config.ranges.indexOf(this._range) > -1 &&
      this.start.isSame(this._range, this.end)
  }
}

module.exports = MongoDateRange
