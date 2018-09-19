import test from 'ava'
import request from 'supertest'
import { app } from '../../../src/api'
import { clear_db, get_db } from '../helper'

test.afterEach.always('clear db ', async t => {
  await clear_db()
})

test('POST /v8/user returns 401 when not logged in', async t => {
  const res = await request(app).post('/v8/user')
    .send()

  t.is(res.status, 403)
})


test('POST /v8/user can create user', async t => {
  const db = await get_db()

  const { insertedId } = await db.collection('instances').insertOne({name: 'test_instance'}) // create instance

  const res = await request(app).post('/v8/user')
    .send({
      username: 'test_user',
      password: 'verysafe123',
      instance_id: insertedId
    })

  t.is(res.status, 200)
  
  const user = await db.collection('users').findOne()
  t.is(user.username, 'test_user')
  t.is(user.instances.length, 1)
  t.is(user.instances[0], insertedId.toString())
})