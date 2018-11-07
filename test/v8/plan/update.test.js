import test from 'ava'
import request from 'supertest'
import { app } from '../../../src/api'
import { clear_db, get_db, create_user } from '../helper'

test.afterEach.always('clear db ', async t => {
  await clear_db()
})


test('GET /v8/plan/:plan_id returns 401 when not logged in', async t => {
  const res = await request(app).put('/v8/plan/plan_id')
    .send({})

  t.is(res.status, 401)
})

test('GET /v8/plan/:plan_id returns 400 when plan_id is invalid', async t => {
  const db = await get_db()
  const user = await create_user()

  const res = await request(app).put(`/v8/plan/5bb5c584ee9763c785b72f5a`)
    .set('API-key', user.key)
    .send({
      name: 'updated_plan'
    })

  t.is(res.status, 400)
  t.is(res.body.error, '_id (plan_id) is invalid')
})

test('GET /v8/plan/:plan_id returns 400 when instance_id is missing or invalid', async t => {
  const db = await get_db()
  const user = await create_user()

  const { insertedId: instance_id } = await db.collection('instances').insertOne({
    name: 'instance_1'
  })

  const { insertedId: plan_id } = await db.collection('plans').insertOne({
    name: 'my_plan'
  })

  const res = await request(app).put(`/v8/plan/${plan_id}`)
    .set('API-key', user.key)
    .send({
      name: 'updated_plan'
    })

  t.is(res.status, 400)
  t.is(res.body.error, 'instance_id is invalid')
})

test('GET /v8/plan/:plan_id returns 401 when user doesn\'t have permission', async t => {
  const db = await get_db()
  const user = await create_user()

  const { insertedId: instance_id } = await db.collection('instances').insertOne({
    name: 'instance_1'
  })

  const { insertedId: plan_id } = await db.collection('plans').insertOne({
    name: 'my_plan'
  })

  const res = await request(app).put(`/v8/plan/${plan_id}?instance_id=${instance_id}`)
    .set('API-key', user.key)
    .send({
      name: 'updated_plan'
    })

  t.is(res.status, 401)
  t.is(res.body.error, 'Not authorised')
})