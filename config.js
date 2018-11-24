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

  /**
   * Should add 'That day till today' range to StatSet
   * @type {boolean}
   */
  isTillTodayAllowed: true,

  dates: {
    floor: '2017-11-04',
    ceil: '2017-12-15',
    today: '2017-12-15',
  },

  activitySettings: {
    activeDuration: '1 week',
    activePurchases: 7,
    churnDelay: '10 days',
    churnDuration: '1 day',
  }
}
