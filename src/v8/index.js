const Auth = require('./lib/auth')

// TODO: rename to auth, when /lib/Auth has been renamed/moved
const auth_controller = require('./controllers/auth')
const plan = require('./controllers/plan')
const record = require('./controllers/record')
const assignment_plan = require('./controllers/assignment_plan')
const config = require('./controllers/config')
const geodata = require('./controllers/geodata')
const instance = require('./controllers/instance')
const user = require('./controllers/user')
const permission = require('./controllers/permission')
const download_records = require('./controllers/download_records')

const {is_logged_in} = require('./lib/middleware/is_logged_in')

const {url_base} = require('./lib/url_helper')

Auth.updateUserList()
// TODO: Remove side effect
let _version = '';

const version_meta = (req, res) => res.send({
    DOUMA_API: process.env.SOURCE_VERSION || 'DEV',
    version: _version
})

const POST = 'post'
const GET = 'get'
const PUT = 'put'
const DELETE = 'delete'


const endpoints = [
    {
        permissions: ['*'],
        method: GET,
        path: '/',
        callback: version_meta
    },

    // PLAN
    {
        permissions: ['read:irs_plan', 'read:irs_monitor', 'read:irs_tasker'],
        method: GET,
        path: '/plan/detail/:plan_id',
        callback: plan.findOne
    },
    {
        permissions: ['write:irs_plan', 'write:irs_monitor', 'write:irs_tasker'],
        method: PUT,
        path: '/plan/:_id',
        callback: plan.update
    },
    {
        permissions: ['write:irs_plan', 'write:irs_monitor', 'write:irs_tasker'],
        method: DELETE,
        path: '/plan/:_id',
        callback: plan.remove
    },
    {
        permissions: ['read:irs_plan', 'read:irs_monitor', 'read:irs_tasker'],
        method: GET,
        path: '/plan/list',
        callback: plan.find
    },
    {
        permissions: ['write:irs_plan'],
        method: POST,
        path: '/plan/create',
        callback: plan.create
    },
    {
        permissions: ['read:irs_plan', 'read:irs_monitor'],
        method: GET,
        path: '/plan/current',
        callback: plan.current
    },


    // RECORD
    {
        method: GET,
        path: '/record/all',
        callback: record.find
    },
    {
        permissions: ['read:irs_record_point'],
        method: GET,
        path: '/record/filtered',
        callback: record.filtered
    },
    {
        permissions: ['read:irs_record_point', 'read:irs_monitor'],
        method: POST,
        path: '/record/updates',
        callback: record.get_updates
    },
    {
        permissions: ['write:irs_record_point'],
        method: POST,
        path: '/record/create',
        callback: record.create
    },

    // ASSIGNMENT PLAN
    {
        permissions: ['read:irs_tasker'],
        method: GET,
        path: '/assignment_plan/current',
        callback: assignment_plan.findOne
    },
    {
        permissions: ['write:irs_tasker'],
        method: POST,
        path: '/assignment_plan/create',
        callback: assignment_plan.create
    },

    // CONFIG
    {
        permissions: ['write:config'],
        method: POST,
        path: '/config/:instance_id',
        callback: config.create
    },
    {
        permissions: ['*'],
        method: GET,
        path: '/config/:config_id',
        callback: config.findOne
    },
    {
        permissions:['*'],
        method:GET,
        path:'/config/latest',
        callback:config.findLatest
    },

    // GEODATA
    {
        permissions: [],
        method:POST,
        path:'/uploadgeodata/:instance_id',
        callback:geodata.upload
    },
    {
        permissions: ['write:config'],
        method: POST,
        path: '/geodata/create/:instance_id',
        callback: geodata.create
    },
    {
        permissions: ['*'],
        method: GET,
        path: '/geodata/:level_name',
        callback: geodata.findOne
    },
    {
        permissions: ['*'],
        method: GET,
        path: '/geodata/summary/:instance_id/level/:level_name',
        callback: geodata.findSummary
    },

    // INSTANCE
    {
        method: POST,
        path: '/instance',
        callback: instance.create
    },
    {
        method: GET,
        path: '/instance',
        callback: instance.find
    },
    {
        method: GET,
        path: '/instance/:instance_id',
        callback: instance.findOne
    },
    {
        method: DELETE,
        path: '/instance/:instance_id',
        callback: instance.remove
    },

    {
        method: GET,
        path: '/instance/:instance_id/published_instanceconfigs',
        callback: instance.populate
    },

    // USERS
    {
        method: POST,
        path: '/user',
        callback: user.create
    },
    {
        method: GET,
        path: '/user',
        callback: user.find
    },
    {
        method: GET,
        path: '/all_users',
        callback: user.findAll
    },
    {
        method: GET,
        path: '/user/:user_id',
        callback: user.findOne
    },
    {
        method: PUT,
        path: '/user/:user_id',
        callback: user.update
    },

    // PERMISSIONS
    {
        method: POST,
        path: '/permission',
        callback: permission.create
    },
    {
        method: GET,
        path: '/permission/:user_id/:instance_id',
        callback: permission.find
    },
    {
        method:GET,
        path:'/permission',
        callback:permission.findAll
    },
    {
        method: GET,
        path: '/permission/:user_id',
        callback: permission.find
    },
    {
        method: DELETE,
        path: '/permission',
        callback: permission.remove
    }
]

module.exports = function (app, version) {
    const version_prefix = '/' + version
    _version = version

    function v(url) {
        return version_prefix + url
    }

    const make_endpoint = (endpoint) => {
        // Auth.addPermission(endpoint.method, url_base(endpoint.path), endpoint.permissions)
        app[endpoint.method](v(endpoint.path), is_logged_in, endpoint.callback)
    }

    // moved the login route outside route definitions, so is_logged_in middleware is not applied.
    app.post(v('/login'), auth_controller.login)

    app.get(v('/download_records'),download_records.find)

    // Not sure we can still use this middleware, 
    // we will probably also need to remove the permissions from the endpoint definitions above. 
    // const version_path_regex = new RegExp(version_prefix)
    // app.use(version_path_regex, Auth.authMiddleware)
    // app.use(version_path_regex, Auth.endpointPermissionsMiddleware)
    // app.use(version_path_regex, Auth.optionsMiddleware)
    endpoints.forEach(make_endpoint)
}
