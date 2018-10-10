import test from 'ava'
import request from 'supertest'
import { app } from '../../../src/api'
import { clear_db, get_db, create_user } from '../helper'

test.afterEach.always('clear db ', async t => {
    await clear_db()
})


test('GET /v8/assignment_plan/:assignment_plan_id returns 401 when not logged in', async t => {
    const res = await request(app).get('/v8/assignment_plan/detail/assignment_plan_id')
        .send({})

    t.is(res.status, 401)
})

test('GET /v8/assignment_plan/:assignment_plan_id returns 401 when user doesn\'t have permission', async t => {
    const db = await get_db()
    const user = await create_user()

    const { insertedId: instance_id } = await db.collection('instances').insertOne({
        name: 'instance_1'
    })

    const { insertedId: assignment_plan_id } = await db.collection('assignment_plans').insertOne({
        instance_id,
        name: 'my_assignment_plan'
    })

    const res = await request(app).get(`/v8/assignment_plan/detail/${assignment_plan_id}`)
        .set('API-key', user.key)

    t.is(res.status, 401)
})

test('GET /v8/assignment_plan/:assignment_plan_id returns 200 when user has permission', async t => {
    const db = await get_db()
    const user = await create_user()

    const { insertedId: instance_id } = await db.collection('instances').insertOne({
        name: 'instance_1'
    })

    const { insertedId: assignment_plan_id } = await db.collection('assignment_plans').insertOne({
        instance_id,
        name: 'my_assignment_plan'
    })

    await db.collection('permissions').insertOne({
        instance_id,
        user_id: user._id,
        value: 'read:irs_assignment_plan'
    })

    const res = await request(app).get(`/v8/assignment_plan/detail/${assignment_plan_id}`)
        .set('API-key', user.key)

    t.is(res.status, 200)
    t.is(res.body.name, 'my_assignment_plan')
})