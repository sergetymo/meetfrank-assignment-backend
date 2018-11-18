const MongoDate = require('./MongoDate')
const MongoDateRange = require('./MongoDateRange')

class MongoDateRangeBuilder {
  /**
   * @param {object} [options]
   * @param {MongoDate} [options.floor] Earliest valid date, 01.01.1970 by default
   * @param {MongoDate} [options.ceil] Latest valid date, NOW by default
   * @param {number} [options.weekStart=1] Starting day of week, 0=Sun, 1=Mon
   */
  constructor(options) {
    this._options = Object.assign({
      floor: new MongoDate(0),
      ceil: new MongoDate(new Date()),
      weekStart: 1,
    }, options)
    this._adjustOptions = {
      weekStart: this._options.weekStart
    }
    this._start = undefined
    this._end = undefined
    this._isRangeStrategy = false
  }

  from(input) {
    if (this._isRangeStrategy) throw new Error('MongoDateRangeBuilder from: mixing strategies')
    this._start = new MongoDate(input)
    return this
  }

  to(input) {
    if (this._isRangeStrategy) throw new Error('MongoDateRangeBuilder to: mixing strategies')
    this._end = new MongoDate(input)
    return this
  }

  expand() {
    this._start = this._start.startOf('day')
    this._end = this._end.endOf('day')
    return this
  }

  dayOf(input) {
    return this._rangeOf('day', input)
  }

  weekOf(input) {
    return this._rangeOf('week', input)
  }

  monthOf(input) {
    return this._rangeOf('month', input)
  }

  _rangeOf(range, input) {
    if (this._isRangeStrategy || this._start || this._end) console.warn('MongoDateRangeBuilder '+range+'Of: boundaries are already set, overwriting')
    this._isRangeStrategy = true
    this._start = new MongoDate(input).startOf(range, this._adjustOptions)
    this._end = new MongoDate(input).endOf(range, this._adjustOptions)
    return this
  }

  build() {
    if (!this.validate()) throw new Error('MongoDateRangeBuilder build: collected data in invalid')
    return new MongoDateRange(this._start, this._end)
  }

  validate() {
    return this._ensureInstances() &&
      this._ensureCorrectOrder() &&
      this._ensureCorrectBoundaries() &&
      true
  }

  _ensureInstances() {
    return this._start instanceof MongoDate && this._end instanceof MongoDate
  }

  _ensureCorrectOrder() {
    if (this._start.isAfter(this._end)) {
      [this._start, this._end] = [this._end, this._start]
    }
    return true
  }

  _ensureCorrectBoundaries() {
    if (this._start.isBefore(this._options.floor)) {
      this._start = new MongoDate(this._options.floor)
    }
    if (this._end.isAfter(this._options.ceil)) {
      this._end = new MongoDate(this._options.ceil)
    }
    return true
  }
}

module.exports = MongoDateRangeBuilder