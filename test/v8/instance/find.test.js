import test from 'ava'
import request from 'supertest'
import { app } from '../../../src/api'
import { clear_db, get_db, create_user } from '../helper'

test.afterEach.always('clear db ', async t => {
  await clear_db()
})

test('GET /v8/instance returns 401 when not logged in', async t => {
  const res = await request(app).get('/v8/instance')
    .send({})

  t.is(res.status, 401)
  t.is(res.body.error, 'Not logged in')
})

test('GET /v8/instance returns empty array when user has access to no instances', async t => {
  const user = await create_user()

  const res = await request(app).get('/v8/instance')
    .set('API-key', user.key)
    .send({})

  t.is(res.status, 200)
  t.deepEqual(res.body, [])
})

test('GET /v8/instance returns all instances when user is super-admin', async t => {
  const user = await create_user()

  const db = await get_db()

  await db.collection('permissions').insertOne({
    user_id: user._id,
    value: 'super-admin'
  })

  await db.collection('instances').insertOne({
    name: 'instance_1'
  })

  await db.collection('instances').insertOne({
    name: 'instance_2'
  })

  const res = await request(app).get('/v8/instance')
    .set('API-key', user.key)
    .send({})

  t.is(res.status, 200)
  t.is(res.body.length, 2)
})

test('GET /v8/instance returns all instance user has access to ', async t => {
  const user = await create_user()

  const db = await get_db()

  

  const {insertedId: instance_id_1} = await db.collection('instances').insertOne({
    name: 'instance_1'
  })

  const { insertedId: instance_id_2 } = await db.collection('instances').insertOne({
    name: 'instance_2'
  })

  const { insertedId: instance_id_3 } = await db.collection('instances').insertOne({
    name: 'instance_3'
  })

  await db.collection('permissions').insertOne({
    user_id: user._id,
    instance_id: instance_id_1,
    value: 'admin'
  })

  await db.collection('permissions').insertOne({
    user_id: user._id,
    instance_id: instance_id_2,
    value: 'basic'
  })

  const res = await request(app).get('/v8/instance')
    .set('API-key', user.key)
    .send({})

  t.is(res.status, 200)
  t.is(res.body.length, 2)
})