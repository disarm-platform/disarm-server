import test from 'ava'
import request from 'supertest'
import { app } from '../../../src/api'
import { clear_db, get_db, create_user } from '../helper'

test.afterEach.always('clear db ', async t => {
  await clear_db()
})


test('DELETE /v8/permission returns 401 when not logged in', async t => {
  const res = await request(app).delete('/v8/permission')
    .send({})

  t.is(res.status, 401)
})

test('DELETE /v8/permission returns 401 when permissions_id is invalid', async t => {
  // const db = await get_db()
  const user = await create_user()

  const res = await request(app).delete(`/v8/permission`)
    .set('API-key', user.key)
    

  t.is(res.status, 401)
})

test('DELETE /v8/permission returns 401 when not an admin for instance that permission belongs to ', async t => {
  const db = await get_db()
  const user = await create_user()

  const other_user = await create_user({ username: 'user_1' }) 

  const { insertedId: instance_id } = await db.collection('instances').insertOne({
    name: 'test_instance_1'
  })

  const { insertedId: permission_id } = await db.collection('permissions').insertOne({
    user_id: other_user._id,
    instance_id,
    value: 'read:irs_monitor'
  })

  const res = await request(app).delete(`/v8/permission?instance_id=${instance_id}`)
    .set('API-key', user.key)

  t.is(res.status, 401)
})

test('DELETE /v8/permission returns 401 removing admin permission and not being deployment_admin', async t => {
  const db = await get_db()
  const user = await create_user()

  const other_user = await create_user({ username: 'user_1' }) 

  const { insertedId: instance_id } = await db.collection('instances').insertOne({
    name: 'test_instance_1'
  })

  const inserted_permission = {
    user_id: other_user._id,
    instance_id,
    value: 'admin'
  }
   await db.collection('permissions').insertOne(inserted_permission)


  const res = await request(app)
    .delete(`/v8/permission?instance_id=${instance_id}`)
    .set('API-key', user.key)
    .send(inserted_permission)

  t.is(res.status, 401)
})

test('DELETE /v8/permission/:permission_id remove regular permission from user when admin for instance', async t => {
  const db = await get_db()
  const user = await create_user()

  const other_user = await create_user({ username: 'user_1' })

  const { insertedId: instance_id } = await db.collection('instances').insertOne({
    name: 'test_instance_1'
  })

  // the logged in users permission
  const { insertedId: our_permission_id } = await db.collection('permissions').insertOne({
    user_id: user._id,
    instance_id,
    value: 'admin'
  })

  // permission for other user
  const inserted_permission= {
    user_id: other_user._id,
    instance_id,
    value: 'read:irs_monitor'
  }
  await db.collection('permissions').insertOne(inserted_permission)

  console.log('instance_id',instance_id,'user',user)

  const res = await request(app)
    .delete(`/v8/permission?instance_id=${instance_id}`)
    .set('API-key', user.key)
    .send(inserted_permission)
  
    t.is(res.status, 200)

  const permission = await db.collection('permissions').findOne({  user_id: other_user._id,
    instance_id,
    value: 'read:irs_monitor'})

  t.falsy(permission)
})

test('DELETE /v8/permission/:permission_id remove admin permission for instance when deployment_admin', async t => {
  const db = await get_db()
  const user = await create_user({deployment_admin: true})

  const other_user = await create_user({ username: 'user_1' })

  const { insertedId: instance_id } = await db.collection('instances').insertOne({
    name: 'test_instance_1'
  })

  // permission for other user
  const { insertedId: permission_id } = await db.collection('permissions').insertOne({
    user_id: other_user._id,
    instance_id,
    value: 'admin'
  })


  const res = await request(app).delete(`/v8/permission`)
    .set('API-key', user.key)
    .send({    user_id: other_user._id,
      instance_id,
      value: 'admin'})

  t.is(res.status, 200)

  const permission = await db.collection('permissions').findOne({_id: permission_id})
  
  t.falsy(permission)
})