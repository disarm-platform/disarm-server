const fs = require('fs')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const Raven = require('raven')
const compression = require('compression')
const expressMongoDb = require('express-mongo-db')
const fileUpload = require('express-fileupload')

// Logging
const morgan = require('morgan')
const path = require('path')
const accessLogStream = fs.createWriteStream(path.join(__dirname, '..', 'log', 'access.log'), {flags: 'a'})

const ACTIVE_API_VERSIONS = ['v8']

if (process.env.NODE_ENV === 'production') {
    Raven.config('https://ed8917e61540404da408a2a9efba0002:d99248fd72c140398999c7302e1da94b@sentry.io/138843', {
        release: process.env.SOURCE_VERSION || 'DEV'
    }).install()
}

// Create application
const api = express()

// Configure middleware
if (process.env.NODE_ENV === 'production') {
    api.use(Raven.requestHandler())
}


api.use(cors())
api.use(compression())
api.use(morgan('combined', {stream: accessLogStream}))

api.use(expressMongoDb(process.env.MONGODB_URI))

api.use(
    bodyParser.json({
        limit: '500mb'
    })
)

api.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
}))

// Ping route
api.get('/', (req, res) => {
    res.send({
        DOUMA_API: process.env.SOURCE_VERSION || 'DEV',
        route: 'root'
    })
})

// Add version-specific routes
ACTIVE_API_VERSIONS.map(v => {
    const version_routes = require(`./${v}/index`)
    return version_routes(api, v)
})

if (process.env.NODE_ENV === 'production') {
    api.use(Raven.errorHandler())
}


module.exports = {
    api
}
