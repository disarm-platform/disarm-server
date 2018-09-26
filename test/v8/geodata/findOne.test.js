import test from 'ava'
import request from 'supertest'
import { app } from '../../../src/api'
import { clear_db, get_db, create_user } from '../helper'

test.afterEach.always('clear db ', async t => {
  await clear_db()
})

test('GET /v8/geodata/:level_id returns 401 when not logged in', async t => {
  const res = await request(app).get('/v8/geodata/level_id')

  t.is(res.status, 401)
  t.is(res.body.error, 'Not logged in')
})


test('GET /v8/geodata/:level_id returns 401 when not a user for that instance', async t => {
  const db = await get_db()
  const user = await create_user()

  const { insertedId: instance_id } = await db.collection('instances').insertOne({
    name: 'my test intance'
  })

  const { insertedId: level_id } = await db.collection('geodata').insertOne({
    level_name: 'villages',
    instance_id,
    geojson: 'yes, geojson',
    version: 1
  })

  const res = await request(app).get(`/v8/geodata/${level_id}`)
    .set('API-key', user.key)
    .send({})

  t.is(res.status, 401)
  t.is(res.body.error, 'Not authorized')
})


test('GET /v8/geodata/:level_id returns the level when a user for that instance', async t => {
  const db = await get_db()
  const user = await create_user()

  const { insertedId: instance_id } = await db.collection('instances').insertOne({
    name: 'my test intance'
  })

  await db.collection('permissions').insertOne({
    instance_id,
    user_id: user._id,
    value: 'basic'
  })

  const { insertedId: level_id } = await db.collection('geodata').insertOne({
    level_name: 'villages',
    instance_id,
    geojson: 'yes, geojson',
    version: 1
  })

  const res = await request(app).get(`/v8/geodata/${level_id}`)
    .set('API-key', user.key)
    .send({})

  t.is(res.status, 200)
  t.is(res.body.geojson, 'yes, geojson')
})
