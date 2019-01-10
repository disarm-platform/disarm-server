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

test('get from /record/updates returns 401 without logging in', async t => {
    const res = await request(app).get('/v8/record/updates')
        .send({})

    t.is(res.status, 401)
})

test('get from /record/updates returns 401 when user has no instance id', async t => {
    const user = await create_user()

    const res = await request(app).get(`/v8/record/updates`)
        .set('API-key', user.key)

    t.is(res.status, 400)
})

test('get from /record/updates with user with read:irs_record_point returns list of records', async t => {
    const db = await get_db()
    const user = await create_user()

    const personalised_instance_id = 'default'

    const {insertedId: instance_id} = await db.collection('instances').insertOne({
        name: 'my_instance_thing'
    })

    const permisison = await db.collection('permissions').insertOne({
        user_id: user._id,
        instance_id,
        value: 'read:irs_record_point'
    })

    await db.collection('records').insertOne({
        personalised_instance_id,
        instance_id,
        updated_at: +(new Date),
        form_property: 'prop 1'
    })

    await db.collection('records').insertOne({
        personalised_instance_id,
        instance_id,
        updated_at: +(new Date),
        form_property: 'prop 2'
    })

    const start_date = new Date(new Date() - 600000)
    const end_date = new Date()
    const res = await request(app)
        .get(`/v8/record/updates?instance_id=${instance_id}&personalised_instance_id=${personalised_instance_id}&start_date=${start_date}&end_date=${end_date}`)
        .set('API-key', user.key)

    t.is(res.status, 200)

    t.is(res.body.length, 2)
})


test('get from /record/updates records outside of filter', async t => {
    const db = await get_db()
    const user = await create_user()

    const personalised_instance_id = 'default'

    const {insertedId: instance_id} = await db.collection('instances').insertOne({
        name: 'my_instance_thing'
    })

    await db.collection('permissions').insertOne({
        user_id: user._id,
        instance_id,
        value: 'read:irs_record_point'
    })

    await db.collection('records').insertOne({
        personalised_instance_id,
        instance_id,
        updated_at: +(new Date),
        form_property: 'prop 1'
    })

    await db.collection('records').insertOne({
        personalised_instance_id,
        instance_id,
        updated_at: +(new Date),
        form_property: 'prop 2'
    })

    const start_date = new Date(new Date() - 600000)
    const end_date = new Date(new Date() - 300000)
    const res = await request(app)
        .get(`/v8/record/updates?instance_id=${instance_id}&personalised_instance_id=${personalised_instance_id}&start_date=${start_date}&end_date=${end_date}`)
        .set('API-key', user.key)

    t.is(res.status, 200)

    t.is(res.body.length, 2)
})

test('GET from /record/updates with admin user  returns list of records', async t => {
    const db = await get_db()
    const user = await create_user()

    const personalised_instance_id = 'default'

    const {insertedId: instance_id} = await db.collection('instances').insertOne({
        name: 'my_instance_thing'
    })

    await db.collection('permissions').insertOne({
        user_id: user._id,
        instance_id,
        value: 'admin'
    })

    await db.collection('records').insertOne({
        personalised_instance_id,
        instance_id,
        updated_at: +(new Date),
        form_property: 'prop 1'
    })

    await db.collection('records').insertOne({
        personalised_instance_id,
        instance_id,
        updated_at: +(new Date),
        form_property: 'prop 2'
    })

    const start_date = new Date(new Date() - 600000)
    const end_date = new Date()
    const res = await request(app)
        .get(`/v8/record/updates?instance_id=${instance_id}&personalised_instance_id=${personalised_instance_id}&start_date=${start_date}&end_date=${end_date}`)
        .set('API-key', user.key)

    t.is(res.status, 200)

    t.is(res.body.length, 2)
})

test('get from /record/updates without personalised_instance_id return only records without the personalysed_instance_id', async t => {
    const db = await get_db()
    const user = await create_user()

    const personalised_instance_id = 'default'

    const {insertedId: instance_id} = await db.collection('instances').insertOne({
        name: 'my_instance_thing'
    })

    await db.collection('permissions').insertOne({
        user_id: user._id,
        instance_id,
        value: 'read:irs_record_point'
    })

    await db.collection('records').insertOne({
        personalised_instance_id,
        instance_id,
        updated_at: +(new Date),
        form_property: 'prop 1'
    })

    await db.collection('records').insertOne({
        instance_id,
        updated_at: +(new Date),
        form_property: 'prop 2'
    })

    const start_date = new Date(new Date() - 6000000)
    const end_date = new Date()
    const res = await request(app)
        .get(`/v8/record/updates?instance_id=${instance_id}&start_date=${start_date}&end_date=${end_date}`)
        .set('API-key', user.key)

    t.is(res.status, 200)

    t.is(res.body.length, 1)
})

test('get from /record/updates without start_date and end_date', async t => {
    const db = await get_db()
    const user = await create_user()

    const personalised_instance_id = 'default'

    const {insertedId: instance_id} = await db.collection('instances').insertOne({
        name: 'my_instance_thing'
    })

    await db.collection('permissions').insertOne({
        user_id: user._id,
        instance_id,
        value: 'read:irs_record_point'
    })

    await db.collection('records').insertOne({
        personalised_instance_id,
        instance_id,
        updated_at: +(new Date),
        form_property: 'prop 1'
    })

    await db.collection('records').insertOne({
        instance_id,
        updated_at: +(new Date),
        form_property: 'prop 2'
    })

    const res = await request(app)
        .get(`/v8/record/updates?instance_id=${instance_id}&personalised_instance_id=${personalised_instance_id}`)
        .set('API-key', user.key)

    t.is(res.status, 200)
})