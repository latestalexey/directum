#
# Запуск Directum и сценария в нём
#

script = wsh.ScriptName.replace /\W+/, '_'

assign sh.Environment('Process'), script.toUpperCase(), wsh.ScriptFullName

sh.Run """
  "#{launcher}" -S=#{srvdb.s} -D=#{srvdb.d} -CT=Script -F=#{script}
  """
