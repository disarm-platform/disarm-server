import test from 'ava'
import request from 'supertest'
import { app } from '../../../src/api'
import { clear_db, get_db, create_user } from '../helper'

test.afterEach.always('clear db ', async t => {
  await clear_db()
})

test('GET /v8/instance/:instance_id returns 401 when not logged in', async t => {
  const res = await request(app).get('/v8/instance/id')
    .send({})

  t.is(res.status, 401)
  t.is(res.body.error, 'Not logged in')
})

test('GET /v8/instance/:instance_id returns 401 when not a basic user for instance', async t => {
  const db = await get_db()
  const user = await create_user()

  const { insertedId } = await db.collection('instances').insertOne({
    name: 'my test intance'
  })

  const res = await request(app).get(`/v8/instance/${insertedId.toString()}`)
    .set('API-key', user.key)
    .send({})

  t.is(res.status, 401)
  t.is(res.body.error, 'Not authorized')
})

test('GET /v8/instance/:instance returns an instance when requesting it', async t => {
  const db = await get_db()
  const user = await create_user()

  const { insertedId } = await db.collection('instances').insertOne({
    name: 'my test instance'
  })

  await db.collection('permissions').insertOne({
    user_id: user._id,
    instance_id: insertedId,
    value: 'read:irs_monitor'
  })

  const res = await request(app).get(`/v8/instance/${insertedId}`)
    .set('API-key', user.key)

  t.is(res.status, 200)
  t.is(res.body.name, 'my test instance')
})