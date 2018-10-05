import test from 'ava'
import request from 'supertest'
import { ObjectID }  from 'mongodb'
import { app } from '../../../src/api'
import { clear_db, get_db, create_user } from '../helper'

test.afterEach.always('clear db ', async t => {
  await clear_db()
})


test('DELETE /v8/plan/:plan_id returns 401 when not logged in', async t => {
  const res = await request(app).put('/v8/plan/plan_id')
    .send({})

  t.is(res.status, 401)
})

test('DELETE /v8/plan/:plan_id returns 200 and deletes plan', async t => {
  const db = await get_db()
  const user = await create_user()

  const { insertedId: plan_id } = await db.collection('plans').insertOne({
    name: 'my_plan'
  })

  const res = await request(app).delete(`/v8/plan/${plan_id}`)
    .set('API-key', user.key)

  t.is(res.status, 200)


  const plan = await db.collection('plans').findOne({ _id: ObjectID(plan_id)})
  t.is(plan, null)
})