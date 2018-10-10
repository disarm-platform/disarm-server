import test from 'ava'
import request from 'supertest'
import {ObjectID} from 'mongodb'
import {app} from '../../../src/api'
import {clear_db, get_db, create_user} from '../helper'


test.afterEach.always('clear db ', async t => {
    await clear_db()
})

test('post records to /record/create returns 401 when not logged in', async t => {
    const res = await request(app).post('/v8/record/create')
        .send({})

    t.is(res.status, 401)
})

test('post to /record/create with loged in user returns 400 when no instance id', async t => {
    const user = await create_user()

    const res = await request(app).post(`/v8/record/create`)
        .set('API-key', user.key)
        .send([{
            form_property: 'prop'
        }])

    t.is(res.status, 400)
})

test('POST /v8/record/create returns 401 when user does not have permission', async t => {
    const db = await get_db()
    const user = await create_user()

    const {insertedId: instance_id} = await db.collection('instances').insertOne({
        name: 'my instance here'
    })

    const res = await request(app).post(`/v8/record/create?instance_id=${instance_id}`)
        .set('API-key', user.key)
        .send([{
            form_property: 'prop'
        }])

    t.is(res.status, 401)
})

test('post records to /record/create with user with write:irs_record_point returns success', async t => {
    const db = await get_db()
    const user = await create_user()

    const {insertedId: instance_id} = await db.collection('instances').insertOne({
        name: 'my instance here'
    })

    await db.collection('permissions').insertOne({
        user_id: user._id,
        instance_id,
        value: 'write:irs_record_point'
    })

    const res = await request(app).post(`/v8/record/create?instance_id=${instance_id}&personalised_instance_id=pers`)
        .set('API-key', user.key)
        .send([{
            form_property: 'prop'
        }])

    t.is(res.status, 201)

    const record_count = await db.collection('records').find({personalised_instance_id: 'pers'}).count({})
    t.is(record_count, 1)
})

test('post records to /record/create with admin user  returns 201 success', async t => {
    const db = await get_db()
    const user = await create_user()

    const {insertedId: instance_id} = await db.collection('instances').insertOne({
        name: 'my instance here'
    })

    await db.collection('permissions').insertOne({
        user_id: user._id,
        instance_id,
        value: 'admin'
    })

    const res = await request(app).post(`/v8/record/create?instance_id=${instance_id}&personalised_instance_id=pers`)
        .set('API-key', user.key)
        .send([{
            form_property: 'prop'
        }])

    t.is(res.status, 201)

    const record_count = await db.collection('records').count({personalised_instance_id: 'pers'})
    t.is(record_count, 1)
})

test('POST to /record/create without personalized_instance_id creates records with default personalized_instance id', async t => {
    const db = await get_db()
    const user = await create_user()

    const {insertedId: instance_id} = await db.collection('instances').insertOne({
        name: 'my instance here'
    })

    await db.collection('permissions').insertOne({
        user_id: user._id,
        instance_id,
        value: 'admin'
    })

    const res = await request(app).post(`/v8/record/create?instance_id=${instance_id}`)
        .set('API-key', user.key)
        .send([{
            form_property: 'prop'
        }])

    t.is(res.status, 201)

    const record_count = await db.collection('records').find({personalised_instance_id: null}).count({})
    t.is(record_count, 1)
})
