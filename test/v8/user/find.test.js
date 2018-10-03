import test from 'ava'
import request from 'supertest'
import { app } from '../../../src/api'
import { clear_db, get_db, create_user } from '../helper'

test.afterEach.always('clear db ', async t => {
  await clear_db()
})

test('GET /v8/user?instance_id returns 401 when not logged in', async t => {
  const res = await request(app).get('/v8/user')
    .send()

  t.is(res.status, 401)
})


test('GET /v8/user/:user_id returns 400 if no instance_id is in query params', async t => {
  const user = await create_user()

  const res = await request(app).get(`/v8/user?instance_id=instance`)
    .set('API-key', user.key)

  t.is(res.status, 400)
})

test('GET /v8/user/:user_id returns 400 if instance_id is invalid', async t => {
  const user = await create_user()

  const res = await request(app).get(`/v8/user?instance_id=asdasdasdasd`)
    .set('API-key', user.key)

  t.is(res.status, 400)
})


test('GET /v8/user/ returns 401 if not an admin for an instance', async t => {
  const db = await get_db()
  const user = await create_user()

  const { insertedId: instance_id } = await db.collection('instances').insertOne({ name: 'test_instance' }) // create instance


  const res = await request(app).get(`/v8/user?instance_id=${instance_id}`)
    .set('API-key', user.key)

  t.is(res.status, 401)
})


