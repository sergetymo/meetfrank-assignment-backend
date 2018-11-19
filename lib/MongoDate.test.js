import test from 'ava'
import MongoDate from './MongoDate'
import { ObjectId } from 'mongodb'
import { rds, ranges } from '../config'

// constructor
test('constructor from date string', t => {
  const md = new MongoDate('2017-12-15')
  t.is(md.value, new Date('2017-12-15').valueOf())
})
test('constructor from unix timestamp', t => {
  const md = new MongoDate(1513296000000)
  t.is(md.toString(), new Date('2017-12-15').toString())
})
test('constructor from ObjectId', t => {
  const md1 = new MongoDate('2017-12-15')
  const md2 = new MongoDate(md1.toObjectId())
  t.is(md2.value, 1513296000000)
})
test('constructor from Date object', t => {
  const md = new MongoDate(new Date('2017-12-15'))
  t.is(md.value, new Date('2017-12-15').valueOf())
})
test('constructor throws on wrong input', t => {
  t.throws(() => {
    const md = new MongoDate('non-date string')
  }, TypeError)
  t.throws(() => {
    const md = new MongoDate({})
  }, TypeError)
})

// value representations
test('toDate', t => {
  const md = new MongoDate('2017-12-15')
  t.true(md.toDate() instanceof Date)
  t.is(md.toDate().toString(), new Date('2017-12-15').toString())
})
test('toString', t => {
  const md = new MongoDate('2017-12-15')
  t.is(md.toString(), new Date('2017-12-15').toString())
})
test('toDayString', t => {
  const md = new MongoDate('2017-12-15')
  t.is(md.toDayString(), '2017'+rds+'12'+rds+'15')
})
test('toMonthString', t => {
  const md = new MongoDate('2017-12-15')
  t.is(md.toMonthString(), '2017'+rds+'12')
})
test('toSeconds', t => {
  const md = new MongoDate('2017-12-15')
  t.is(md.toSeconds(), 1513296000)
})
test('toObjectId', t => {
  const md = new MongoDate('2017-12-15')
  const seconds = new Date('2017-12-15') / 1000;
  t.true(ObjectId.isValid(md.toObjectId()))
  t.true(ObjectId.createFromTime(seconds).equals(md.toObjectId()))
})

// comparison
test('isEqual', t => {
  const md1 = new MongoDate('2017-12-15')
  const md2 = new MongoDate('2017-12-15')
  const md3 = new MongoDate('2018-01-01')
  t.true(md1.isEqual(md2))
  t.false(md1.isEqual(md3))
  t.true(md1.isEqual(1513296000000))
  t.true(md3.isEqual('2018-01-01'))
})
test('isBefore', t => {
  const md1 = new MongoDate('2017-12-15')
  const md2 = new MongoDate('2017-12-15')
  const md3 = new MongoDate('2018-01-01')
  t.false(md1.isBefore(md2))
  t.true(md1.isBefore(md3))
  t.false(md3.isBefore(1513296000000))
  t.true(md1.isBefore('2018-01-01'))
})
test('isAfter', t => {
  const md1 = new MongoDate('2017-12-15')
  const md2 = new MongoDate('2017-12-15')
  const md3 = new MongoDate('2018-01-01')
  t.false(md1.isAfter(md2))
  t.true(md3.isAfter(md1))
  t.true(md3.isAfter(1513296000000))
  t.false(md1.isAfter('2018-01-01'))
})
test('isSame', t => {
  const md1 = new MongoDate('2017-12-15')
  const md2 = new MongoDate('2017-12-17')
  const md3 = new MongoDate('2018-01-01')
  t.true(md1.isSameDayAs('2017-12-15'))
  t.false(md1.isSameDayAs(md2))
  t.true(md1.isSameWeekAs(md2))
  t.false(md1.isSameWeekAs(md2, { weekStart: 0 }))
  t.true(md1.isSameMonthAs(md2))
  t.false(md1.isSameMonthAs(md3))
  t.throws(() => {
    let rnd = Math.random().toString(36).slice(-5)
    while (ranges.indexOf(rnd) > -1) {
      rnd = Math.random().toString(36).slice(-5)
    }
    const throws = new MongoDate('2017-12-15').isSame(rnd, '2017-12-15')
  })
})

// boundaries
test('startOf', t => {
  const md = new MongoDate('2017-12-15 22:30')
  const monday = md.startOf('week')
  const noon = md.startOf('day')
  const firstOfDec = md.startOf('month')
  t.is(monday.value, 1512943200000)
  t.is(noon.value, 1513288800000)
  t.is(firstOfDec.value, 1512079200000)
})

test('endOf', t => {
  const md = new MongoDate('2017-12-15 22:30')
  const sunday = md.endOf('week')
  const noon = md.endOf('day')
  const thirtyFirstOfDec = md.endOf('month')
  t.is(sunday.value, 1513547999999)
  t.is(noon.value, 1513375199999)
  t.is(thirtyFirstOfDec.value, 1514757599999)
})
