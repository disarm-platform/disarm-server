const root = require('./controllers/root')
const plan = require('./controllers/plan')
const record = require('./controllers/record')
const assignment_plan = require('./controllers/assignment_plan')
const config = require('./controllers/config')
const geodata = require('./controllers/geodata')
const instance = require('./controllers/instance')
const user = require('./controllers/user')
const permission = require('./controllers/permission')

const POST = 'post'
const GET = 'get'
const PUT = 'put'
const DELETE = 'delete'

module.exports = [{
  permissions: ['*'],
  method: GET,
  path: '/',
  callback: root.root
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
    path: '/config', // for instance_id
    callback: config.create
  },
  {
    permissions: ['*'],
    method: GET,
    path: '/config/latest', // for instance_id
    callback: config.findLatest
  },
  {
    permissions: ['*'],
    method: GET,
    path: '/config/:config_id',
    callback: config.findOne
  },

  // GEODATA
  {
    permissions: [],
    method: POST,
    path: '/geodata_level/upload',
    callback: geodata.upload
  },
  {
    permissions: ['*'],
    method: GET,
    path: '/geodata_level/:level_id',
    callback: geodata.findOne
  },
  {
    permissions: ['*'],
    method: GET,
    path: '/geodata/summary', // for instance_id
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
  {
    method:GET,
    path:'/all_with_instances',
    callback:user.populateInstances
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
    method: GET,
    path: '/permission',
    callback: permission.findAll
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
  },
  {
    method: POST,
    path: '/create_bulk',
    callback: permission.create_bulk
  }
]