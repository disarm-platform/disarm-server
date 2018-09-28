import test from 'ava'
import request from 'supertest'
import { app } from '../../../src/api'
import { clear_db, get_db, create_user } from '../helper'

test.afterEach.always('clear db ', async t => {
  await clear_db()
})

test('GET /v8/config/:config_id returns 401 when not logged in', async t => {
  const res = await request(app).get('/v8/config/:config_id')
    .send({})

  t.is(res.status, 401)
  t.is(res.body.error, 'Not logged in')
})

test('GET /v8/config/:instance_id returns 401 when not a user for instance', async t => {
  const db = await get_db()
  const user = await create_user()

  const { insertedId: instance_id } = await db.collection('instances').insertOne({
    name: 'my test intance'
  })

  const { insertedId: config_id } = await db.collection('instance_configs').insertOne({
    version: 1,
    instance_id
  })

  const res = await request(app).get(`/v8/config/${config_id.toString()}`)
    .set('API-key', user.key)
    .send({})

  t.is(res.status, 401)
  t.is(res.body.error, 'Not authorized')
})

test('GET /v8/config/:instance_id returns 401 when a user for instance', async t => {
  const db = await get_db()
  const user = await create_user()

  const { insertedId: instance_id } = await db.collection('instances').insertOne({
    name: 'my test intance'
  })

  const { insertedId: config_id } = await db.collection('instance_configs').insertOne({
    version: 1,
    instance_id
  })

  await db.collection('permissions').insertOne({
    instance_id,
    user_id: user._id,
    value: 'read:irs_monitor'
  })

  const res = await request(app).get(`/v8/config/${config_id.toString()}`)
    .set('API-key', user.key)

  t.is(res.status, 200)
  t.is(res.body.version, 1)
  t.is(res.body.instance_id, instance_id.toString())

})
