import test from 'ava'
import MongoDate from './MongoDate'
import MongoDateRange from './MongoDateRange'
import MongoDateRangeBuilder from './MongoDateRangeBuilder'

test('throws on build without needed data', t => {
  t.throws(() => {
    const mdr1 = new MongoDateRangeBuilder().build()
  }, Error)
})

test('builds using from-to strategy', t => {
  const mdr = new MongoDateRangeBuilder()
    .from('2017-12-15')
    .to('2017-12-31')
    .build()
  
  t.true(mdr instanceof MongoDateRange)
  t.is(mdr.start.value, new Date('2017-12-15').valueOf())
  t.is(mdr.end.value, new Date('2017-12-31').valueOf())
})

test('builds using from-to strategy with expand', t => {
  const mdr = new MongoDateRangeBuilder()
    .from('2017-12-15')
    .to('2017-12-31')
    .expand()
    .build()
  
  t.true(mdr instanceof MongoDateRange)
  t.is(mdr.start.value, 1513288800000)
  t.is(mdr.end.value, 1514757599999)
})

test('autocorrects boundaries and order in from-to strategy', t => {
  const mdr = new MongoDateRangeBuilder({
    ceil: new MongoDate('2017-12-17').endOf('day')
  }).from('2017-12-31')
    .to('2017-12-15')
    .build()
  
  t.true(mdr instanceof MongoDateRange)
  t.is(mdr.start.value, new Date('2017-12-15').valueOf())
  t.is(mdr.end.value, 1513547999999)
})

test('builds using range strategy', t => {
  const mdr1 = new MongoDateRangeBuilder()
    .dayOf('2017-12-15')
    .build()
  const mdr2 = new MongoDateRangeBuilder()
    .weekOf('2017-12-15')
    .build()
  const mdr3 = new MongoDateRangeBuilder()
    .monthOf('2017-12-15')
    .build()

  t.true(mdr1 instanceof MongoDateRange)
  t.true(mdr2 instanceof MongoDateRange)
  t.true(mdr3 instanceof MongoDateRange)
  t.is(mdr1.start.value, 1513288800000)
  t.is(mdr1.end.value, 1513375199999)
  t.is(mdr2.start.value, 1512943200000)
  t.is(mdr2.end.value, 1513547999999)
  t.is(mdr3.start.value, 1512079200000)
  t.is(mdr3.end.value, 1514757599999)
})

test('throws when mixing strategies', t => {
  t.throws(() => {
    const mdr = new MongoDateRangeBuilder()
      .weekOf('2017-11-01')
      .from('2017-12-15')
      .build()
  }, Error)
})