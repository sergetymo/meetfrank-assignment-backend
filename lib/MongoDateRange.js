class MongoDateRange {
  /**
   * @param {MongoDate} start 
   * @param {MongoDate} end 
   */
  constructor(start, end) {
    this.start = start
    this.end = end
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

  // TODO: generate strings for cache keys
  toDayString() {}
  toWeekString() {}
  toMonthString() {}
}

module.exports = MongoDateRange