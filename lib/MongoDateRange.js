const config = require('../config')

class MongoDateRange {
  /**
   * Should not be instantiated outside MongoDateRangeBuilder
   * @see MongoDateRangeBuilder
   * 
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
    return this.start.toDayString() + config.rds + config.rds + this.end.toDayString()
  }

  _ensureCorrectRange() {
    if (!!this._range) return config.ranges.indexOf(this._range) > -1 && this.start.isSame(this._range, this.end)
    return true
  }
}

module.exports = MongoDateRange
