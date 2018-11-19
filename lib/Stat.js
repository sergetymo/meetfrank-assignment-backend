class Stat {
  constructor(purchases) {
    this._purchases = purchases
    this._users = this._purchases.reduce((acc, val) => {
      if (acc.indexOf(val.user) < 0) acc.push(val.user)
      return acc
    }, [])
  }

  toQuantity() {
    return {
      purchases: this._purchases.length,
      users: this._users.length,
    }
  }
}

module.exports = Stat