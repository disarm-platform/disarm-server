const Auth = require('./lib/auth')

const auth_controller = require('./controllers/auth')
const download_records = require('./controllers/download_records')
const endpoints = require('./routes')

const {is_logged_in} = require('./lib/middleware/is_logged_in')

Auth.updateUserList()
// TODO: Remove side effect
let _version = '';

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

    // is_logged_in middleware is not applied to following routes, which need to be accessed without 
    // an API-Key in the headers
    app.post(v('/login'), auth_controller.login)
    app.get(v('/download_records'),download_records.find)

    endpoints.forEach(make_endpoint)
}
