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

test('get from /download_records returns 401 when not logged in', async t => {
    const res = await request(app).get('/v8/download_records')
        .send({})

    t.is(res.status, 403)
})

test('get from /download_records with loged in user returns 401 if no instance_id', async t => {
    const db = await get_db()
    const user = await create_user()

    const res = await request(app).get(`/v8/download_records`)
        //.set('API-key', user.key)

    t.is(res.status, 403)
})

test('GET from /download_records with admin user  returns csv of records', async t => {
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

    const res = await request(app).get(`/v8/download_records?download_key=${user.key}&instance_id=${instance_id}&personalised_instance_id=${personalised_instance_id}`)

    t.is(res.status, 200)

    t.true(res.text.startsWith(`"_id","personalised_instance_id","instance_id","updated_at","form_field"`))
})

test('get from /download_records with user with read:irs_record_point returns a csv table of records', async t => {
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

    const res = await request(app).get(`/v8/download_records?download_key=${user.key}&instance_id=${instance_id}&personalised_instance_id=${personalised_instance_id}`)

    t.is(res.status, 200)

    t.true(res.text.startsWith(`"_id","personalised_instance_id","instance_id","updated_at","form_field"`))
})


test('get from /download_records with user with read:irs_record_point with api_keyreturns a csv table of records', async t => {
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

    const res = await request(app).get(`/v8/download_records?instance_id=${instance_id}&personalised_instance_id=${personalised_instance_id}`)
        .set('API-Key',user.key)
    t.is(res.status, 200)

    t.true(res.text.startsWith(`"_id","personalised_instance_id","instance_id","updated_at","form_field"`))
})
