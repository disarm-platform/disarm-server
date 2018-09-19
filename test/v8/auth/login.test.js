import test from 'ava'
import request from 'supertest'
import bcrypt from 'bcrypt'
import { app } from '../../../src/api'
import { clear_db, get_db } from '../helper'

test.afterEach.always('clear db ', async t => {
  await clear_db()
})

test('POST /v8/login returns 401 when no username is passed', async t => {
  const res = await request(app).post('/v8/login')
    .send()

  t.is(res.status, 401)
})


test('POST /v8/login logs user in', async t => {
  const db = await get_db()

  const { insertedId } = await db.collection('instances').insertOne({
    name: 'test_instance'
  })

  const encrypted_password = await bcrypt.hash('password123', 10)

  await db.collection('users').insertOne({
    username: 'user1',
    encrypted_password,
    instances: [insertedId]
  })

  const res = await request(app).post('/v8/login')
    .send({
      username: 'user1',
      password: 'password123'
    })

  t.is(res.status, 200)

  // TODO: ensure api_key is returned and saved in session
})