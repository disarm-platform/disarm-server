import test from 'ava'
import request from 'supertest'
import { app } from '../../../src/api'
import { clear_db, get_db, create_user } from '../helper'

test.afterEach.always('clear db ', async t => {
  await clear_db()
})

test('DELETE /v8/instance/:instance_id returns 401 when not logged in', async t => {
  const res = await request(app).delete('/v8/instance/id')
    .send({})

  t.is(res.status, 401)
  t.is(res.body.error, 'Not logged in')
})

test('DELETE /v8/instance/:instance_id returns 401 when not a super-admin user for instance', async t => {
  const db = await get_db()
  const user = await create_user()

  const { insertedId } = await db.collection('instances').insertOne({
    name: 'my test intance'
  })

  const res = await request(app).delete(`/v8/instance/${insertedId.toString()}`)
    .set('API-key', user.key)
    .send({})

  t.is(res.status, 401)
  t.is(res.body.error, 'Not authorized')
})

test('DELETE /v8/instance/:instance deletes an instance when requesting it', async t => {
  const db = await get_db()
  const user = await create_user({deployment_admin: true})

  const { insertedId } = await db.collection('instances').insertOne({
    name: 'my test instance'
  })

  const res = await request(app).delete(`/v8/instance/${insertedId}`)
    .set('API-key', user.key)

  t.is(res.status, 200)
  
  const instance_count = await db.collection('instances').count({})
  t.is(instance_count, 0)
})