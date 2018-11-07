import test from 'ava'
import request from 'supertest'
import { ObjectID } from 'mongodb'
import { app } from '../../../src/api'
import { clear_db, get_db, create_user } from '../helper'

test.afterEach.always('clear db ', async t => {
    await clear_db()
})


test('POST /v8/assignment_plan/create returns 401 when not logged in', async t => {
    const res = await request(app).post('/v8/assignment_plan/create')
        .send({})

    t.is(res.status, 401)
})

test('POST /v8/assignment_plan/create returns 400 when instance_id is missing', async t => {
    const user = await create_user()

    const res = await request(app).post(`/v8/assignment_plan/create`)
        .set('API-key', user.key)
        .send({
            name: 'my_assignment_plan'
        })

    t.is(res.status, 400)
})

test('POST /v8/assignment_plan/:assignment_plan_id returns 401 when user does not have permission', async t => {
    const db = await get_db()
    const user = await create_user()

    const { insertedId: instance_id } = await db.collection('instances').insertOne({
        name: 'my instance here'
    })

    const res = await request(app).post(`/v8/assignment_plan/create?instance_id=${instance_id}`)
        .set('API-key', user.key)
        .send({
            name: 'my_assignment_plan'
        })

    t.is(res.status, 401)
})

test('POST /v8/assignment_plan/:assignment_plan_id returns 200', async t => {
    const db = await get_db()
    const user = await create_user()

    const {insertedId: instance_id} = await db.collection('instances').insertOne({
        name: 'my instance here'
    })

    await db.collection('permissions').insertOne({
        user_id: user._id,
        instance_id,
        value: 'write:irs_assignment_plan'
    })

    const res = await request(app).post(`/v8/assignment_plan/create?instance_id=${instance_id}`)
        .set('API-key', user.key)
        .send({
            name: 'my_assignment_plan'
        })

    t.is(res.status, 200)

    const assignment_plan_count = await db.collection('assignment_plans').count({})
    t.is(assignment_plan_count, 1)

})