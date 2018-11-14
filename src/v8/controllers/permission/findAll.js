const ObjectID = require('mongodb').ObjectID
const { can } = require('../../lib/helpers/can')

/**
 * @api {get} /permission/:user_id/:instance_id Get permissions for a user
 * @apiName Get permissions for a user
 * @apiGroup Permission
 *
 * @apiParam {string} user_id The id of the user
 * @apiParamExample {json} Request-Example:
 */

module.exports = async function find(req, res) {

    const allowed = req.user.deployment_admin
    if (!allowed) {
        return res.status(401).send()
    }
    const permissions = await req.db.collection('permissions').find({}).toArray()

    return res.send(permissions)
}

