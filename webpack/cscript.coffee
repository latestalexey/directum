#
# Эвристика для выбора выполняемого файла
#
module.exports = (asset)->
  if /\((["''"])InternetExplorer[.]Application\1\)/.test asset.source()
    'start wscript.exe'
  else
    'cscript.exe'
