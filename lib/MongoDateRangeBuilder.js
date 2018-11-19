const MongoDate = require('./MongoDate')
const MongoDateRange = require('./MongoDateRange')
const config = require('../config')

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
      weekStart: config.weekStart,
    }, options)
    this._adjustOptions = {
      weekStart: this._options.weekStart
    }
    this._start = undefined
    this._end = undefined
    this._range = undefined
  }

  // For now, from-to and rangeOf strategies are mutually exclusive
  // TODO: Implement from-range and range-to build strategies
  from(input) {
    if (!!this._range) throw new Error('MongoDateRangeBuilder from: mixing strategies')
    this._start = new MongoDate(input)
    return this
  }

  to(input) {
    if (!!this._range) throw new Error('MongoDateRangeBuilder to: mixing strategies')
    this._end = new MongoDate(input)
    return this
  }

  expand() {
    this._start = this._start.startOf('day')
    this._end = this._end.endOf('day')
    return this
  }

  dayOf(input) {
    return this.rangeOf('day', input)
  }

  weekOf(input) {
    return this.rangeOf('week', input)
  }

  monthOf(input) {
    return this.rangeOf('month', input)
  }

  rangeOf(range, input) {
    if (this._range || this._start || this._end) console.warn('MongoDateRangeBuilder '+range+'Of: boundaries are already set, overwriting')
    this._range = range
    this._start = new MongoDate(input).startOf(range, this._adjustOptions)
    this._end = new MongoDate(input).endOf(range, this._adjustOptions)
    return this
  }

  build() {
    if (!this.validate()) throw new Error('MongoDateRangeBuilder build: collected data in invalid')
    return new MongoDateRange(this._start, this._end, this._range)
  }

  validate() {
    return this._ensureInstances() &&
      this._ensureCorrectOrder() &&
      this._ensureCorrectBoundaries() &&
      this._ensureCorrectRange() &&
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

  _ensureCorrectRange() {
    if (!!this._range) return config.ranges.indexOf(this._range) > -1
    return true
  }
}

module.exports = MongoDateRangeBuilder
