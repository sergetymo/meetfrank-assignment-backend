module.exports = {
  /**
   * Readable date separator
   * Avoid using '-' and '.'
   * @type {string}
   */
  rds: '_',

  /**
   * Starting day of the week
   * 0=Sun, 1=Mon and so on
   * @type {number}
   */
  weekStart: 1,

  /**
   * Valid fixed date ranges
   * @type {string[]}
   */
  ranges: ['day', 'week', 'month'],

  dates: {
    floor: '2017-11-04',
    ceil: '2017-12-15',
    now: '2017-12-15',
  }
}
