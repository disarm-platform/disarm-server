import test from 'ava'
import request from 'supertest'
import { app } from '../../../src/api'
import { clear_db, get_db, create_user } from '../helper'

test.afterEach.always('clear db ', async t => {
  await clear_db()
})

test('GET /v8/permission/:user_id returns 401 when not logged in', async t => {
  const res = await request(app).get('/v8/permission/user_id')
    .send({})

  t.is(res.status, 401)
})

test('GET /v8/permission returns 401 when not an admin for instance that user has permissions for', async t => {
  const db = await get_db()
  const user = await create_user()

  const { insertedId: instance_id } = await db.collection('instances').insertOne({
    name: 'test_instance_1'
  })

  const other_user = await create_user({username: 'user_1'})

  await db.collection('permissions').insertOne({
    user_id: other_user._id,
    instance_id,
    value: 'read:irs_monitor'
  })


  const res = await request(app).get(`/v8/permission/${other_user._id}/${instance_id}?instance_id=instance`)
    .set('API-key', user.key)

  t.is(res.status, 401)
})


test('GET /v8/permission returns 200 and only permission for instance', async t => {
  const db = await get_db()
  

  const { insertedId: instance_id_1 } = await db.collection('instances').insertOne({
    name: 'test_instance_1'
  })

  const { insertedId: instance_id_2 } = await db.collection('instances').insertOne({
    name: 'test_instance_2'
  })


  // set up our own user
  const user = await create_user()

  await db.collection('permissions').insertOne({
    user_id: user._id,
    instance_id: instance_id_1,
    value: 'admin'
  })


  // set up the user we are interested in getting permissions for
  const other_user = await create_user({ username: 'user_1' })

  await db.collection('permissions').insertOne({
    user_id: other_user._id,
    instance_id: instance_id_1,
    value: 'read:irs_monitor'
  })

  await db.collection('permissions').insertOne({
    user_id: other_user._id,
    instance_id: instance_id_2,
    value: 'read:irs_tasker'
  })


  const res = await request(app).get(`/v8/permission/${other_user._id}/${instance_id_1}?instance_id=instance`)
    .set('API-key', user.key)

  t.is(res.status, 200)

  t.is(res.body.length, 1) // only one permission

  t.is(res.body[0].value, 'read:irs_monitor')
})

test('GET /v8/permission returns 200 for self', async t => {
  const db = await get_db()


  const { insertedId: instance_id_1 } = await db.collection('instances').insertOne({
    name: 'test_instance_1'
  })

  // set up our own user
  const user = await create_user()

  await db.collection('permissions').insertOne({
    user_id: user._id,
    instance_id: instance_id_1,
    value: 'read:irs_monitor'
  })

  const res = await request(app).get(`/v8/permission/${user._id}?instance_id=instance`)
    .set('API-key', user.key)

  t.is(res.status, 200)

  t.is(res.body.length, 1) // only one permission

  t.is(res.body[0].value, 'read:irs_monitor')
})