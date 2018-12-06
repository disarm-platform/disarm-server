const ObjectID = require('mongodb').ObjectID
/**
 * @api {delete} /user/:id Remove user
 * @apiName Remove User
 * @apiGroup User
 *
 * @apiParam {string} id The of the user to remove
 */

module.exports = async function remove(req, res) {
  const user_id_to_remove = req.params['id']

  if (!user_id_to_remove) {
    return res.status(400).send({error: "user id is required"})
  }

  // TODO: Check if user is admin or super-admin

  const user_tobe_deleted = await db.collection('users').findOne({_id: ObjectID(user_id_to_remove)})
  
  if(user_tobe_deleted.deployment_admin){
    return res.status(403).send('Not Allowed')
  }

  await req.db.collection('users').deleteOne({ _id: ObjectID(user_id_to_remove)})

  // TODO: Remove all the permissions from the user

  res.send({status: 'successfully removed user'})
}