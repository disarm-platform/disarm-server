import test from 'ava'
import request from 'supertest'
import { app } from '../../../src/api'
import { clear_db, get_db, create_user } from '../helper'

test.afterEach.always('clear db ', async t => {
  await clear_db()
})

test('GET /v8/user/:user_id returns 401 when not logged in', async t => {
  const res = await request(app).get('/v8/user/user_id')
    .send()

  t.is(res.status, 401)
})


test('GET /v8/user/:user_id returns 400 if no user exists for user_id', async t => {
  const user = await create_user()

  const res = await request(app).get(`/v8/user/5bb36cb8a9b2bb907d9a4146`)
    .set('API-key', user.key)

  t.is(res.status, 400)
})


test('GET /v8/user/:user_id returns 401 if not an admin for an instance user has permission for', async t => {
  const user = await create_user()

  const other_user = await create_user({username: 'test_user_3'})
  const res = await request(app).get(`/v8/user/${other_user._id}`)
    .set('API-key', user.key)

  t.is(res.status, 401)
})


