import test from 'ava'
import request from 'supertest'
import { ObjectID } from 'mongodb'
import { app } from '../../../src/api'
import { clear_db, get_db, create_user } from '../helper'

test.afterEach.always('clear db ', async t => {
  await clear_db()
})


test('GET /v8/plan/current returns 401 when not logged in', async t => {
  const res = await request(app).get('/v8/plan/current')

  t.is(res.status, 401)
})

test('GET /v8/plan/current returns 400 when instance_id is missing', async t => {
  const user = await create_user()

  const res = await request(app).get(`/v8/plan/current`)
    .set('API-key', user.key)

  t.is(res.status, 400)
})

test('GET /v8/plan/current returns 401 when user does not have permission', async t => {
  const db = await get_db()
  const user = await create_user()

  const personalised_instance_id = 'default'

  const { insertedId: instance_id } = await db.collection('instances').insertOne({
    name: 'my instance here'
  })

  const { instance_id: plan_id } = await db.collection('plans').insertOne({
    instance_id,
    personalised_instance_id,
    name: 'my plan'
  })

  const res = await request(app).get(`/v8/plan/current?instance_id=${instance_id}&personalised_instance_id=${personalised_instance_id}`)
    .set('API-key', user.key)

  t.is(res.status, 401)
})


test('GET /v8/plan/current returns 200', async t => {
  const db = await get_db()
  const user = await create_user()

  const personalised_instance_id = 'default'

  const { insertedId: instance_id } = await db.collection('instances').insertOne({
    name: 'my instance here'
  })

  const { instance_id: plan_id } = await db.collection('plans').insertOne({
    instance_id,
    personalised_instance_id,
    name: 'my plan',
    updated_at: (+ new Date)
  })

  await db.collection('permissions').insertOne({
    user_id: user._id,
    instance_id,
    value: 'read:irs_plan'
  })

  const res = await request(app).get(`/v8/plan/current?instance_id=${instance_id}&personalised_instance_id=${personalised_instance_id}`)
    .set('API-key', user.key)

  t.is(res.status, 200)
  t.is(res.body.name, 'my plan')
})