import test from 'ava'
import request from 'supertest'
import {app} from '../../../../src/api'

const admin_key = '24e66af5c3c2b25e72ec42c51b88e676'

test('POST /v7/login without credentials => 401', async t => {
    t.plan(2)

  const res = await request(app).post('/v7/login?country=swz').send({})

    t.is(res.status, 401)
    t.true(res.text.startsWith('{"message":'))
})

test('POST /v7/login with wrong credentials => 401', async t => {
    t.plan(2)

    const creds = {
        username: 'wrong',
        password: 'user'
    }
  const res = await request(app).post('/v7/login?country=swz').send(creds)

    t.is(res.status, 401)
    t.true(res.text.startsWith('{"message":'))
})

test('POST /v7/login with correct credentials => 200', async t => {
    t.plan(4)

    const creds = {
        username: 'admin',
        password: 'password'
    }

  const res = await request(app).post('/v7/login?country=swz').send(creds)

    t.is(res.status, 200)
    t.true(res.text.length > 0)

    const user = JSON.parse(res.text)
    t.is(user.username, 'admin')
    t.is(user.key, admin_key)
})
