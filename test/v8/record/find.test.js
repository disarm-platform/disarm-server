import test from 'ava'
import request from 'supertest'
import {ObjectID} from 'mongodb'
import {app} from '../../../src/api'
import {clear_db, get_db, create_user} from '../helper'
//query = instance_id and personalized instance id
// personilized_instance_id is optional defaults to 'default'

test.afterEach.always('clear db ', async t => {
    await clear_db()
})

test('get from /record/all returns 401 when not logged in', async t => {
    const res = await request(app).get('/v8/record/all')
        .send({})

    t.is(res.status, 401)
})

test('get from /record/all with loged in user returns 401 if no instance_id', async t => {
    const db = await get_db()
    const user = await create_user()

    const res = await request(app).get(`/v8/plan/list`)
        .set('API-key', user.key)

    t.is(res.status, 400)
})

test('GET from /record/all with admin user  returns list of records', async t => {
    const db = await get_db()
    const user = await create_user()

    const personalised_instance_id = 'default'

    const {insertedId: instance_id} = await db.collection('instances').insertOne({
        name: 'my_instance_thing'
    })

    await db.collection('records').insertOne({
        personalised_instance_id,
        instance_id,
        updated_at: +(new Date),
        form_field: 'field 1'
    })

    await db.collection('records').insertOne({
        personalised_instance_id,
        instance_id,
        updated_at: +(new Date),
        form_field: 'field 2'
    })

    await db.collection('permissions').insertOne({
        user_id: user._id,
        instance_id,
        value: 'admin'
    })

    const res = await request(app).get(`/v8/record/all?instance_id=${instance_id}&personalised_instance_id=${personalised_instance_id}`)
        .set('API-key', user.key)

    t.is(res.status, 200)

    t.is(res.body.length, 2)
})

test('get from /record/all with user with read:irs_record_point returns list of records', async t => {
    const db = await get_db()
    const user = await create_user()

    const personalised_instance_id = 'default'

    const {insertedId: instance_id} = await db.collection('instances').insertOne({
        name: 'my_instance_thing'
    })

    await db.collection('records').insertOne({
        personalised_instance_id,
        instance_id,
        updated_at: +(new Date),
        form_field: 'field 1'
    })

    await db.collection('records').insertOne({
        personalised_instance_id,
        instance_id,
        updated_at: +(new Date),
        form_field: 'field 2'
    })

    await db.collection('permissions').insertOne({
        user_id: user._id,
        instance_id,
        value: 'read:irs_records_point'
    })

    const res = await request(app).get(`/v8/record/all?instance_id=${instance_id}&personalised_instance_id=${personalised_instance_id}`)
        .set('API-key', user.key)

    t.is(res.status, 200)

    t.is(res.body.length, 2)
})
