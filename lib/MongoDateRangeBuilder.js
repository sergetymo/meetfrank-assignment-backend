const MongoDate = require('./MongoDate')
const MongoDateRange = require('./MongoDateRange')
const Duration = require('./Duration')
const config = require('../config')

class MongoDateRangeBuilder {
  /**
   * Builds correct MongoDateRange object using three mutually exclusive strategies
   * @param {object} [options]
   * @param {MongoDate} [options.floor] Earliest valid date, 01.01.1970 by default
   * @param {MongoDate} [options.ceil] Latest valid date, NOW by default
   * @param {number} [options.weekStart=1] Starting day of week, 0=Sun, 1=Mon
   *
   * @example
   * // From-to strategy:
   * new MongoDateRangeBuilder().from('2017-11-04').to('2017-11-15').build()
   *
   * // Duration strategy
   * new MongoDateRangeBuilder().from('2017-11-04').duration('3 days').build()
   *
   * // Fixed range strategy
   * new MongoDateRangeBuilder().rangeOf('week', '2017-11-04').build()
   *
   * @see config.ranges
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
    this._duration = undefined
  }

  from(input) {
    if (!!this._range || (!!this._duration && !!this._end)) throw new Error('MongoDateRangeBuilder from: mixing strategies')
    this._start = new MongoDate(input)
    return this
  }

  to(input) {
    if (!!this._range || (!!this._duration && !!this._start)) throw new Error('MongoDateRangeBuilder to: mixing strategies')
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
    if (!!this._duration) throw new Error('MongoDateRangeBuilder ' + range + 'Of: mixing strategies')
    if (!!this._range || !!this._start || !!this._end) console.warn('MongoDateRangeBuilder '+range+'Of: boundaries are already set, overwriting')
    this._range = range
    this._start = new MongoDate(input).startOf(range, this._adjustOptions)
    this._end = new MongoDate(input).endOf(range, this._adjustOptions)
    return this
  }

  duration(input) {
    if (!!this._range || (!!this._start && !!this._end)) throw new Error('MongoDateRangeBuilder duration: mixing strategies')
    this._duration = new Duration(input)
    return this
  }

  build() {
    if (!this.validate()) throw new Error('MongoDateRangeBuilder build: collected data in invalid')
    return new MongoDateRange(this._start, this._end, this._range)
  }

  validate() {
    return true &&
      this._ensureCorrectDuration() &&
      this._ensureInstances() &&
      this._ensureCorrectOrder() &&
      this._ensureCorrectBoundaries() &&
      this._ensureCorrectRange() &&
      true
  }

  _ensureInstances() {
    return this._start instanceof MongoDate && this._end instanceof MongoDate &&
      (this._duration === undefined || this._duration instanceof Duration)
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

  _ensureCorrectDuration() {
    if (!!this._duration) {
      if (!!this._start) {
        this._end = this._start.add(this._duration)
      } else if (!!this._end) {
        this._start = this._end.subtract(this._duration)
      } else {
        return false
      }
      this.expand()
    }
    return true
  }
}

module.exports = MongoDateRangeBuilder
