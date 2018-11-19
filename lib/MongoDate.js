const ObjectId = require('mongodb').ObjectId
const config = require('../config.js')

class MongoDate {
  /**
   * @param {string|number|Date|ObjectId} input
   */
  constructor (input) {
    if (input instanceof MongoDate) {
      this.value = input.toDate().valueOf()
    } else if (input instanceof Date) {
      this.value = input.valueOf()
    } else if (input instanceof ObjectId && ObjectId.isValid(input)) {
      this.value = input.getTimestamp().valueOf()
    } else if (typeof input === 'string') {
      const date = new Date(input)
      if (date.toString() !== 'Invalid Date') {
        this.value = date.valueOf()
      } else {
        throw new TypeError('MongoDate constructor: unrecognized input string')
      }
    } else if (typeof input === 'number') {
      this.value = parseInt(input, 10)
    } else {
      throw new TypeError('MongoDate constructor: unrecognized input format')
    }
  }

  toDate() {
    return new Date(this.value)
  }
  toString() {
    return this.toDate().toString()
  }
  toDayString() {
    const date = this.toDate()
    return date.getFullYear() + config.rds +
      this._zeroFill(date.getMonth() + 1) +
      config.rds +
      this._zeroFill(date.getDate())
  }
  toMonthString() {
    const date = this.toDate()
    return date.getFullYear() + config.rds + this._zeroFill(date.getMonth() + 1)
  }
  toSeconds() {
    return Math.floor(this.value / 1000)
  }
  toObjectId() {
    return ObjectId.createFromTime(this.toSeconds())
  }

  isEqual(input) {
    const md = this._ensureInstance(input)
    return this.value === md.value
  }

  isBefore(input) {
    const md = this._ensureInstance(input)
    return this.value < md.value
  }
  isAfter(input) {
    const md = this._ensureInstance(input)
    return this.value > md.value
  }

  isSame(period, input, options) {
    const opts = Object.assign({
      weekStart: config.weekStart
    }, options)
    const md = this._ensureInstance(input)
    const range = this._ensureCorrectRange(period)
    return this.startOf(range, opts).value === md.startOf(range, opts).value
  }
  isSameDay(input) {
    return this.isSame('day', input)
  }
  isSameWeek(input, options) {
    return this.isSame('week', input, options)
  }
  isSameMonth(input) {
    return this.isSame('month', input)
  }

  /**
   * @param {string} period
   * @param {object} [options]
   * @param {number} [options.weekStart]
   */
  startOf(period, options = {weekStart: config.weekStart}) {
    let date = this.toDate()
    switch (period) {
      case 'day':
        return new MongoDate(date.setHours(0,0,0,0))
      case 'week':
        const day = date.getDay()
        const diff = (day < options.weekStart ? 7 : 0) + day - options.weekStart
        date.setDate(date.getDate() - diff)
        return new MongoDate(date.setHours(0,0,0,0))
      case 'month':
        date.setDate(1)
        return new MongoDate(date.setHours(0,0,0,0))
      default:
        throw new Error('MongoDate startOf: unknown period')
    }
  }

  /**
   * @param {string} period
   * @param {object} [options]
   * @param {number} [options.weekStart]
   */
  endOf(period, options = {weekStart: config.weekStart}) {
    let date = this.toDate()
    switch (period) {
      case 'day':
        return new MongoDate(date.setHours(23,59,59,999))
      case 'week':
        const day = date.getDay()
        const diff = (day < options.weekStart ? -7 : 0) + 6 - (day - options.weekStart)
        date.setDate(date.getDate() + diff)
        return new MongoDate(date.setHours(23,59,59,999))
      case 'month':
        const month = date.getMonth()
        date.setFullYear(date.getFullYear(), month + 1, 0)
        return new MongoDate(date.setHours(23,59,59,999))
      default:
        throw new Error('MongoDate endOf: unknown period')
    }
  }

  _ensureInstance(input) {
    if (input instanceof MongoDate) return input
    return new MongoDate(input)
  }

  _ensureCorrectRange(str) {
    const range = typeof str === 'string' && str.toLowerCase()
    if (!range || config.ranges.indexOf(range) < 0) throw new Error('MongoDate: invalid range')
    return range
  }

  _zeroFill(n) {
    const i = parseInt(n, 10)
    return i < 10 ? '0' + i : '' + i
  }
}

module.exports = MongoDate
