const ObjectID = require('mongodb').ObjectID
const { can } = require('../../lib/helpers/can')
const bcrypt = require('bcryptjs')

module.exports = async function update(req, res) {
  const incoming_user = req.body;
  
  const user = await req.db.collection('users').findOne({_id: ObjectID(incoming_user._id)})
  if (!user) {
    return res.status(400).send()
  }

  let allowed_to_edit_user = req.user.deployment_admin


  if (!allowed_to_edit_user) {
    return res.status(401).send()
  }

  const username = req.body.username
  if (!username) {
    return res.status(400).send()
  }
  if(incoming_user.password){
    incoming_user.encrypted_password =  await bcrypt.hash(incoming_user.password, 10)
  }
  
  delete incoming_user._id
  delete incoming_user.password

  try {
    await req.db.collection('users').updateOne({_id:user._id},incoming_user)
    res.send()
  }catch (e) {
    res.status(400).send(e.message)
  }


}