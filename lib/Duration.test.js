import test from 'ava'
import Duration from './Duration'
const config = require('../config')

test('constructor from Duration', t => {
  const d1 = new Duration('1 day')
  const d2 = new Duration(d1)

  t.is(d1.amount, d2.amount)
  t.is(d1.range, d2.range)
})

test('constructor from single-word range string', t => {
  const d1 = new Duration('day')
  const d2 = new Duration('week')
  const d3 = new Duration('month')

  t.is(d1.amount, 1)
  t.is(d1.range, 'day')
  t.is(d2.amount, 1)
  t.is(d2.range, 'week')
  t.is(d3.amount, 1)
  t.is(d3.range, 'month')
})

test('constructor from double-word range string', t => {
  const d1 = new Duration('1 day')
  const d2 = new Duration('1 week')
  const d3 = new Duration('1 month')

  t.is(d1.amount, 1)
  t.is(d1.range, 'day')
  t.is(d2.amount, 1)
  t.is(d2.range, 'week')
  t.is(d3.amount, 1)
  t.is(d3.range, 'month')
})

test('constructor from string/strings in singular/plural form', t => {
  const d1 = new Duration('days')
  const d2 = new Duration('2 weeks')
  const d3 = new Duration('1 months')

  t.is(d1.amount, 1)
  t.is(d1.range, 'day')
  t.is(d2.amount, 2)
  t.is(d2.range, 'week')
  t.is(d3.amount, 1)
  t.is(d3.range, 'month')
})

test('constructor from non-spaced string', t => {
  const d1 = new Duration('7days')
  const d2 = new Duration('2week')

  t.is(d1.amount, 7)
  t.is(d1.range, 'day')
  t.is(d2.amount, 2)
  t.is(d2.range, 'week')
})

test('constructor from floating-pointed digit string', t => {
  const d = new Duration('45.5 days')

  t.is(d.amount, 45)
  t.is(d.range, 'day')
})

test('constructor from object', t => {
  const d = new Duration({
    amount: 5,
    range: 'month'
  })

  t.is(d.amount, 5)
  t.is(d.range, 'month')
})

test('constructor throws on incorrect input', t => {
  t.throws(() => {
    const d = new Duration('1')
  })

  t.throws(() => {
    const d = new Duration('4 decades')
  })

  t.throws(() => {
    const d = new Duration(150)
  })
})
