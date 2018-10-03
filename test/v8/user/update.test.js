import test from 'ava'
import request from 'supertest'
import { app } from '../../../src/api'
import { clear_db, get_db, create_user } from '../helper'

test.afterEach.always('clear db ', async t => {
  await clear_db()
})

test('PUT /v8/user/:user_id returns 401 when not logged in', async t => {
  const res = await request(app).put('/v8/user/user_id')
    .send()

  t.is(res.status, 401)
})


test('PUT /v8/user/:user_id returns 401 when not an admin for user', async t => {
  const user = await create_user()

  const other_user = await create_user({username: 'test_user'})

  const res = await request(app).put(`/v8/user/${other_user._id}`)
    .set('API-key', user.key)
    .send()

  t.is(res.status, 401)
})


test('PUT /v8/user/:user_id changes username', async t => {
  const db = await get_db()
  const user = await create_user()

  const {insertedId: instance_id} = await db.collection('instances').insertOne({
    name: 'test_instance_1'
  })

  await db.collection('permissions').insertOne({
    user_id: user._id,
    instance_id,
    value: 'admin'
  })

  const other_user = await create_user({ username: 'test_user' })

  await db.collection('permissions').insertOne({
    user_id: other_user._id,
    instance_id,
    value: 'read:irs_monitor'
  })

  const res = await request(app).put(`/v8/user/${other_user._id}`)
    .set('API-key', user.key)
    .send({
      username: 'not_test_user'
    })

  t.is(res.status, 200)

  const updated_user = await db.collection('users').findOne({_id: other_user._id})

  t.is(updated_user.username, 'not_test_user')
})