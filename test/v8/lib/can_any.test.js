import test from 'ava'
import { clear_db, get_db, create_user } from '../helper'
import { can_any } from '../../../src/v8/lib/helpers/can'

test.afterEach.always('clear db ', async t => {
  await clear_db()
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

  const result = await can_any(user._id, insertedId, ['read:irs_monitor', 'read:irs_tasker'])
  t.true(result)
})

test('returns false if user does not have permission for instance', async t => {
  const db = await get_db()
  const { insertedId } = await db.collection('instances').insertOne({
    name: 'my instance'
  })
  const user = await create_user({ access_level: 'general' })

  const result = await can_any(user._id, insertedId, ['read:irs_monitor'])
  t.false(result)
})