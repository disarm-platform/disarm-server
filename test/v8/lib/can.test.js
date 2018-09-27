import test from 'ava'
import { clear_db, get_db, create_user } from '../helper'
import {can} from '../../../src/v8/lib/helpers/can'

test.afterEach.always('clear db ', async t => {
  await clear_db()
})

test('returns true for super-admins', async t => {
  const db = await get_db()
  const user = await create_user({deployment_admin: true})

  const result = await can(user._id)

  t.true(result)
})

test('returns true for if user is admin for instance', async t => {
  const db = await get_db()
  // TODO: Create concept of admin for instance
  const user = await create_user()
  
  const { insertedId } = await db.collection('instances').insertOne({
    name: 'my second instance'
  })

  await db.collection('permissions').insertOne({
    user_id: user._id,
    instance_id: insertedId,
    value: 'admin'
  })

  const result = await can(user._id, insertedId)

  t.true(result)
})

test('returns true for if user has permission for instance', async t => {
  const db = await get_db()
  const { insertedId } = await db.collection('instances').insertOne({
    name: 'my instance'
  })
  const user = await create_user({ access_level: 'general' })

  await db.collection('permissions').insertOne({
    instance_id: insertedId,
    user_id: user._id,
    value: 'read:irs_monitor'
  })

  const result = await can(user._id, insertedId, 'read:irs_monitor')
  t.true(result)
})

test('returns false if user does not have permission for instance', async t => {
  const db = await get_db()
  const { insertedId } = await db.collection('instances').insertOne({
    name: 'my instance'
  })
  const user = await create_user({ access_level: 'general' })
  
  const result = await can(user._id, insertedId, 'read:irs_monitor')
  t.false(result)
})