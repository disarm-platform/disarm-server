import test from 'ava'
import request from 'supertest'
import { app } from '../../../src/api'
import { clear_db, get_db, create_user } from '../helper'

test.afterEach.always('clear db ', async t => {
  await clear_db()
})

test('POST /v8/geodata/:instance_id returns 401 when not logged in', async t => {
  const res = await request(app).post('/v8/geodata/id')
    .send({})

  t.is(res.status, 401)
  t.is(res.body.error, 'Not logged in')
})


test('POST /v8/geodata/:instance_id returns 401 when not a admin', async t => {
  const db = await get_db()
  const user = await create_user()

  const { insertedId } = await db.collection('instances').insertOne({
    name: 'my test intance'
  })

  const res = await request(app).post(`/v8/geodata/${insertedId.toString()}`)
    .set('API-key', user.key)
    .send({})

  t.is(res.status, 401)
  t.is(res.body.error, 'Not authorized')
})

test('POST /v8/geodata/:instance_id can create new geodata level', async t => {
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

  const res = await request(app).post(`/v8/geodata_level/upload?instance_id=${insertedId}`)
    .set('API-key', user.key)
    .attach('file','localidad.json')
    .send({
      level_name: 'villages',
      geojson: {some_geojson: true}
    })


  const number_of_docs = await db.collection('geodata').count({ level_name: 'villages' })

  t.is(res.status, 200)
  t.is(number_of_docs, 1)
})

test.skip('POST /v8/geodata/:instance_id creating a new geodata level and sets version to 1', async t => { 
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

  const res = await request(app).post(`/v8/geodata/${insertedId}`)
    .set('API-key', user.key)
    .send({
      level_name: 'villages',
      geojson: {is_geojson: true}
    })
  t.is(res.status, 200)


  const geodata_level = await db.collection('geodata').findOne({ level_name: 'villages' })

  t.is(geodata_level.version, 1)
})

test.skip('POST /v8/geodata/:instance_id creating a geodata level when one exists bumps the version by 1', async t => { 
  const db = await get_db()
  const user = await create_user()

  const { insertedId } = await db.collection('instances').insertOne({
    name: 'my test intance'
  })

  await db.collection('geodata').insertOne({
    version: 3,
    instance_id: insertedId,
    level_name: 'consitituencies',
    geojson: {is_valid: true}
  })

  await db.collection('permissions').insertOne({
    user_id: user._id,
    instance_id: insertedId,
    value: 'admin'
  })

  const res = await request(app).post(`/v8/geodata/${insertedId}`)
    .set('API-key', user.key)
    .send({
      level_name: 'consitituencies',
      geojson: 'yes'
    })

  t.is(res.status, 200)


  const geodata_level = await db.collection('geodata').findOne({ 
    level_name: 'consitituencies',
    instance_id: insertedId,
    version: 4
  })

  t.truthy(geodata_level)
})