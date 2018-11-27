const config = require('../config')

// TODO: calculate duration in milliseconds and include into instanve
// TODO: calculate duration from milliseconds number in constructor
// TODO: expand ranges up to millenniums and down to milliseconds, ditch config usage
// TODO: express any duration using ranges from above
// e.g. 1 year 3 monts 25 days 4 hours 1 minute
class Duration {
  /**
   * @param {string|Duration|object} input
   */
  constructor(input) {
    if (!input) {
      throw new Error('Duration constructor: empty input')
    } else if (input instanceof Duration) {
      this.amount = input.amount
      this.range = input.range
    } else if (typeof input === 'string') {
      let amount
      let range
      const tuple = input.split(' ')
      if (tuple.length > 2) throw new Error('Duration constructor: incorrect string input')
      if (tuple.length === 1) {
        const possibleAmount = parseInt(tuple[0], 10)
        if (!isNaN(possibleAmount)) {
          amount = possibleAmount
          range = tuple[0].replace(/\.|[0-9]|s$/gi, '').toLowerCase()
        } else {
          amount = 1
          range = tuple[0].replace(/s$/gi, '').toLowerCase()
        }
      } else {
        amount = parseInt(tuple[0], 10)
        range = tuple[1].replace(/s$/gi, '').toLowerCase()
      }
      if (isNaN(amount)) throw new Error('Duration constructor: incorrect amount in string')
      if (config.ranges.indexOf(range) < 0) throw new Error('Duration constructor: incorrect range in string')
      this.amount = amount
      this.range = range
    } else if (!!input.amount && !!input.range &&
      !isNaN(parseInt(input.amount), 10) &&
      config.ranges.indexOf(input.range) > -1
    ) {
      this.amount = input.amount
      this.range = input.range
    } else {
      throw new Error('Duration constructor: incorrect input')
    }
  }

  toString() {
    return this.amount + ' ' + this.range + this.amount > 1 ? 's' : ''
  }
}

module.exports = Duration
