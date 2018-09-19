
/**
 * This is a model description, 
 * its only purpose is to show what things exist on a given model.
 */

const user = {
  username: 'string',

  encrypted_password: 'string',

  access_level: 'string', // in the old config-server it was one of ['super-admin','admin','general','guest']
  
  instances: ['mongo_ids'] // array of mongo ids, this shows which instances a user can log in to, 
}