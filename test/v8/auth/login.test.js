import test from 'ava'
import request from 'supertest'
import bcrypt from 'bcryptjs'
import { app } from '../../../src/api'
import { clear_db, get_db } from '../helper'
import { ObjectID } from 'mongodb'

test.afterEach.always('clear db ', async t => {
  await clear_db()
})

test('POST /v8/login returns 401 when no username is passed', async t => {
  const res = await request(app).post('/v8/login?instance_id=instance')
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

  const res = await request(app).post('/v8/login?instance_id=instance')
    .send({
      username: 'user1',
      password: 'password123'
    })

  t.is(res.status, 200)

  const session = await db.collection('sessions').findOne({ user_id: ObjectID(res.body._id)})

  t.is(res.body.key, session.api_key)
})