const root = (req, res) => res.send({
  DOUMA_API: process.env.SOURCE_VERSION || 'DEV',
  version: _version
})
const ping = (req, res) => res.send()
module.exports = {root, ping}