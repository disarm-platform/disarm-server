const root = (req, res) => res.send({
  DOUMA_API: process.env.SOURCE_VERSION || 'DEV',
  version: _version
})
module.exports = {root}