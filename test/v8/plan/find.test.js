import test from 'ava'
import request from 'supertest'
import { ObjectID } from 'mongodb'
import { app } from '../../../src/api'
import { clear_db, get_db, create_user } from '../helper'

test.afterEach.always('clear db ', async t => {
  await clear_db()
})


test('GET /v8/plan returns 401 when not logged in', async t => {
  const res = await request(app).get('/v8/plan/list')
    .send({})

  t.is(res.status, 401)
})

test('GET /v8/plan returns 400 if no instance_id', async t => {
  const db = await get_db()
  const user = await create_user()

  const res = await request(app).get(`/v8/plan/list`)
    .set('API-key', user.key)

  t.is(res.status, 400)
})

test('GET /v8/plan returns 200 and returns plans', async t => {
  const db = await get_db()
  const user = await create_user()

  const personalised_instance_id = 'default'

  const {insertedId: instance_id} = await db.collection('instances').insertOne({
    name: 'my_instance_thing'
  })

  await db.collection('plans').insertOne({
    personalised_instance_id,
    targets: [],
    instance_id,
    updated_at: +(new Date),
    name: 'my_plan 1'
  })

  await db.collection('plans').insertOne({
    personalised_instance_id,
    targets: [],
    instance_id,
    updated_at: + (new Date),
    name: 'my_plan 2'
  })

  const res = await request(app).get(`/v8/plan/list?instance_id=${instance_id}&personalised_instance_id=${personalised_instance_id}`)
    .set('API-key', user.key)

  t.is(res.status, 200)

  t.is(res.body.length, 2)
 // t.is(res.body[0].name, 'my_plan 2')
 // t.is(res.body[1].name, 'my_plan 1')
})