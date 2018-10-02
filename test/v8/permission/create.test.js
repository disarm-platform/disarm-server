import test from 'ava'
import request from 'supertest'
import { app } from '../../../src/api'
import { clear_db, get_db, create_user } from '../helper'

test.afterEach.always('clear db ', async t => {
  await clear_db()
})

test('POST /v8/permission returns 401 when not logged in', async t => {
  const res = await request(app).post('/v8/permission')
    .send({})

  t.is(res.status, 401)
})

test('POST /v8/permission returns 401 when not an admin for instance', async t => {
  const db = await get_db()
  const user = await create_user()

  const { insertedId: instance_id } = await db.collection('instances').insertOne({
    name: 'test_instance_1'
  })

  const res = await request(app).post('/v8/permission')
    .set('API-key', user.key)
    .send({
      instance_id,
      user_id: user._id,
      value: 'read:irs_monitor'
    })

  t.is(res.status, 401)
})

test('POST /v8/permission returns 401 when adding admin and not being deployment_admin', async t => {
  const db = await get_db()
  const user = await create_user()

  const { insertedId: instance_id } = await db.collection('instances').insertOne({
    name: 'test_instance_1'
  })

  const res = await request(app).post('/v8/permission')
    .set('API-key', user.key)
    .send({
      instance_id,
      user_id: user._id,
      value: 'admin'
    })

  t.is(res.status, 401)
})

test('POST /v8/permission returns 400 when instance_id is invalid', async t => {
  const db = await get_db()
  const user = await create_user()

  const { insertedId: instance_id } = await db.collection('instances').insertOne({
    name: 'test_instance_1'
  })

  await db.collection('permissions').insertOne({
    user_id: user._id,
    instance_id,
    value: 'admin'
  })

  const res = await request(app).post('/v8/permission')
    .set('API-key', user.key)
    .send({
      user_id: user._id,
      instance_id: 'instance_id1',
      value: 'irs_monitor'
    })
    
    t.is(res.status, 400)
})

test('POST /v8/permission returns 400 when user_id is invalid', async t => {
  const db = await get_db()
  const user = await create_user()

  const { insertedId: instance_id } = await db.collection('instances').insertOne({
    name: 'test_instance_1'
  })

  await db.collection('permissions').insertOne({
    user_id: user._id,
    instance_id,
    value: 'admin'
  })

  const res = await request(app).post('/v8/permission')
    .set('API-key', user.key)
    .send({
      instance_id,
      user_id: undefined,
      value: 'read:irs_monitor'
    })
  
    t.is(res.status, 400)
})


test('POST /v8/permission returns 400 when permission is invalid', async t => {
  const db = await get_db()
  const user = await create_user()

  const { insertedId: instance_id } = await db.collection('instances').insertOne({
    name: 'test_instance_1'
  })

  await db.collection('permissions').insertOne({
    user_id: user._id,
    instance_id,
    value: 'admin'
  })

  const res = await request(app).post('/v8/permission')
    .set('API-key', user.key)
    .send({
      instance_id,
      user_id: user._id,
      value: 'not a valid permission'
    })

  t.is(res.status, 400)
})



test('POST /v8/permission returns 200 when everything is valid and is deployment_admin', async t => {
  const db = await get_db()
  const user = await create_user({deployment_admin: true})

  const { insertedId: instance_id } = await db.collection('instances').insertOne({
    name: 'test_instance_1'
  })

  const res = await request(app).post('/v8/permission')
    .set('API-key', user.key)
    .send({
      instance_id,
      user_id: user._id,
      value: 'read:irs_monitor'
    })
  
  t.is(res.status, 200)

  const permission = await db.collection('permissions').findOne({
    instance_id,
    user_id: user._id,
    value: 'read:irs_monitor'
  })

  t.truthy(permission)
})
