import test from 'ava'
import request from 'supertest'
import { app } from '../../../src/api'
import { clear_db, get_db, create_user } from '../helper'

test.afterEach.always('clear db ', async t => {
  await clear_db()
})

test('POST /v8/config returns 401 when not logged in', async t => {
  const res = await request(app).post('/v8/config/id?instance_id=instance')
    .send({})

  t.is(res.status, 401)
  t.is(res.body.error, 'Not logged in')
})


test('POST /v8/config returns 401 when not a admin', async t => {
  const db = await get_db()
  const user = await create_user()

  const { insertedId } = await db.collection('instances').insertOne({
    name: 'my test intance'
  })

  const res = await request(app).post(`/v8/config/${insertedId.toString()}?instance_id=instance`)
    .set('API-key', user.key)
    .send({})

  t.is(res.status, 401)
  t.is(res.body.error, 'Not authorized')
})

test('POST /v8/config can create config', async t => {
  const db = await get_db()
  const user = await create_user()

  const {insertedId} = await db.collection('instances').insertOne({
    name: 'my test intance'
  })

  await db.collection('permissions').insertOne({
    user_id: user._id,
    instance_id: insertedId,
    value: 'admin'
  })

  const res = await request(app).post(`/v8/config/${insertedId}?instance_id=instance`)
    .set('API-key', user.key)
    .send({
      name: 'test config'
    })


  const number_of_docs = await db.collection('instance_configs').count({ name: 'test config' })

  t.is(res.status, 200)
  t.is(number_of_docs, 1)
})

test('POST /v8/config creating a new config sets version to 1', async t => {
  const db = await get_db()
  const user = await create_user()

  const { insertedId } = await db.collection('instances').insertOne({
    name: 'my test intance'
  })

  await db.collection('permissions').insertOne({
    user_id: user._id,
    instance_id: insertedId,
    value: 'admin'
  })

  const res = await request(app).post(`/v8/config/${insertedId}?instance_id=instance`)
    .set('API-key', user.key)
    .send({
      name: 'test config'
    })
  t.is(res.status, 200)


  const config = await db.collection('instance_configs').findOne({ name: 'test config' })

  t.is(config.version, 1)
})

test('POST /v8/config creating a config when an one exists bumps the version by 1', async t => {
  const db = await get_db()
  const user = await create_user()

  const { insertedId } = await db.collection('instances').insertOne({
    name: 'my test intance'
  })

  await db.collection('instance_configs').insertOne({ 
    version: 1, 
    instance_id: insertedId,
    name: 'some config' 
  })

  await db.collection('permissions').insertOne({
    user_id: user._id,
    instance_id: insertedId,
    value: 'admin'
  })

  const res = await request(app).post(`/v8/config/${insertedId}?instance_id=instance`)
    .set('API-key', user.key)
    .send({
      name: 'test config'
    })
  t.is(res.status, 200)


  const config = await db.collection('instance_configs').findOne({ name: 'test config' })

  t.is(config.version, 2)
})