const Auth = require('./lib/auth')
const addPermission = Auth.addPermission

const login = require('./controllers/login')
const plan = require('./controllers/plan')
const record = require('./controllers/record')
const assignment_plan = require('./controllers/assignment_plan')
const config = require('./controllers/config')
const geodata = require('./controllers/geodata')
const season = require('./controllers/season')

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
    {
        permissions: ['*'],
        method: GET,
        path: '/refresh_users',
        callback: Auth.forceUpdateUserList
    },
    {
        permissions: ['*'],
        method: POST,
        path: '/login',
        callback: login.login
    },
    {
        permissions: ['read:irs_plan', 'read:irs_monitor', 'read:irs_tasker'],
        method: GET,
        path: '/plan/detail/:plan_id',
        callback: plan.plan_by_id
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
        callback: plan.list_all
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
        callback: plan.get_current
    },
    {
        permissions: ['read:irs_record_point', 'read:irs_monitor'],
        method: GET,
        path: '/record/all',
        callback: record.get_all
    },
    {
        permissions: ['read:irs_record_point'],
        method: GET,
        path: '/record/filtered',
        callback: record.date_filtered
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
    {
        permissions:['write:config'],
        method: POST,
        path:'/config',
        callback:config.create
    },
    {
        permissions:['write:seasons'],
        method: PUT,
        path:'/seasons',
        callback: season.update
    },
    {
        permissions:['write:config'],
        method:POST,
        path:'/config/:config_id',
        callback:config.create
    },
    {
        permissions:['*'],
        method:GET,
        path:'/config',
        callback:config.findOne
    },
    {
        permissions:['*'],
        method:GET,
        path:'/config/:config_id',
        callback:config.findOne
    },
    {
        permissions:['write:config'],
        method: PUT,
        path:'/config',
        callback: config.update
    },
    {
        permissions:['write:config'],
        method: PUT,
        path:'/config/:config_id',
        callback: config.update
    },
    {
        permissions:['write:config'],
        method: DELETE,
        path:'/config',
        callback: config.remove
    },{
        permissions:['write:config'],
        method: POST,
        path:'/geodata/:instance/:spatial_hierarchy',
        callback: geodata.create
    },
    {
        permissions:['*'],
        method: GET,
        path:'/geodata',
        callback:geodata.findOne
    },
    {
        permissions:['*'],
        method:GET,
        path:'/geodata/:instance',
        callback: geodata.findOne
    },
    {
        permissions:['*'],
        method: GET,
        path:'/geodata/:instance/:spatial_hierarchy',
        callback: geodata.findOne
    },
    {
        permissions:['write:config'],
        method: PUT,
        path:'/geodata',
        callback:geodata.update
    },
    {
        permissions:['write:config'],
        method: DELETE,
        path:'/geodata',
        callback: geodata.remove
    }
]

module.exports = function (app, version) {
    const version_prefix = '/' + version
    _version = version

    function v(url) {
        return version_prefix + url
    }

    const make_endpoint = (endpoint) => {
        addPermission(endpoint.method, url_base(endpoint.path), endpoint.permissions)
        app[endpoint.method](v(endpoint.path), endpoint.callback)
    }

    const version_path_regex = new RegExp(version_prefix)
    app.use(version_path_regex, Auth.authMiddleware)
    app.use(version_path_regex, Auth.endpointPermissionsMiddleware)
    app.use(version_path_regex, Auth.optionsMiddleware)

    endpoints.forEach(make_endpoint)
}
