#
# Объект document в браузере
#
module.exports = if wsh?
  ie().Document
else
  document
