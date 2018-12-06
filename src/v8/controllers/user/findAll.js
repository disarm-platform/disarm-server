const ObjectID = require('mongodb').ObjectID
const { can } = require('../../lib/helpers/can')
/**
 * @api {get} /user Get users
 * @apiName Get users
 * @apiGroup User
 *
 * @apiParam {string} instance_id The id for the instance
 */

module.exports = async function findAll(req, res) {
    const instance_id = req.query['instance_id']

    //  Check if user is admin or super-admin
    const allowed = req.user.deployment_admin
    if (!allowed) {
        return res.status(401).send()
    }

    // Might have to first find permissions, if we go with new approach suggested
    const users = await req.db.collection('users').find({}).toArray()

    res.send(users)
}