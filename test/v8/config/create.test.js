import test from 'ava'
import request from 'supertest'
import { app } from '../../../src/api'
import { clear_db, get_db, create_user } from '../helper'

test.afterEach.always('clear db ', async t => {
  await clear_db()
})

test('POST /v8/config returns 401 when not logged in', async t => {
  const res = await request(app).post('/v8/config/id')
    .send({})

  t.is(res.status, 401)
  t.is(res.body.error, 'Not logged in')
})


test('POST /v8/config returns 401 when not a admin', async t => {
  const db = await get_db()
  const user = await create_user()

  const { insertedId } = await db.collection('instances').insertOne({
    name: 'my test intance'
  })

  const res = await request(app).post(`/v8/config/${insertedId.toString()}`)
    .set('API-key', user.key)
    .send({})

  t.is(res.status, 401)
  t.is(res.body.error, 'Not authorized')
})

test('POST /v8/config can create config', async t => {
  const db = await get_db()
  const user = await create_user()

  const {insertedId} = await db.collection('instances').insertOne({
    name: 'my test intance'
  })

  await db.collection('permissions').insertOne({
    user_id: user._id,
    instance_id: insertedId,
    value: 'admin'
  })

  const res = await request(app).post(`/v8/config/${insertedId}`)
    .set('API-key', user.key)
    .send({
      name: 'test config'
    })


  const number_of_docs = await db.collection('instance_configs').count({ name: 'test config' })

  t.is(res.status, 200)
  t.is(number_of_docs, 1)
})