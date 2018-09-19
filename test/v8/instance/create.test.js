import test from 'ava'
import request from 'supertest'
import { app } from '../../../src/api'
import {clear_db, get_db} from '../helper'

test.afterEach.always('clear db ', async t => {
  await clear_db()
})

test('POST /v8/instance returns 401 when not logged in', async t => {
  const res = await request(app).post('/v8/instance')
    .send({
      name: 'test instance'
    })

  t.is(res.status, 401)
})


test('POST /v8/instance can create instances', async t => {
  const res = await request(app).post('/v8/instance')
    .send({
      name: 'test instance'
    })
  
  const db = await get_db()

  const number_of_docs = await db.collection('instances').count({})
  
  t.is(res.status, 200)
  t.is(number_of_docs, 1)
})