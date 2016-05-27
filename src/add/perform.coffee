#
# Собственно генерация пользователей а также всего, что понадобится впредь (ц)
#

users = require './cb'
steps = require './perform.steps'

t = without ->
  table
    border: true
    cellspacing: 0
    ->
      thead ->
        th z for z in '№ Пользователь'.split ' '
        th title: z.title, z.id for z in @steps
      tbody ->
        for u, i in @users
          tr
            class: if i & 1 then 'odd' else 'even'
            ->
              td align: 'right', i+1
              td u.AD.sAMAccountName
              td align: 'center', br for i in [1..5]
  center()

interior.innerHTML = t
  steps: steps
  users: users

tBody = $ 'tbody', interior
.pop()

perform = ->
  for u, i in users
    row = tBody.rows[i]
    for step, n in steps
      cell = row.cells[2+n]
      try
        step.fn u
        cell.innerHTML = '+'
      catch error
        cell.innerHTML = '#'
        cell.title = error.message
        throw error if DEBUG
  finish()

finish = ->
  $ 'center', interior
  .pop()
  .innerHTML = "That's all folks!"

evloop.push perform
