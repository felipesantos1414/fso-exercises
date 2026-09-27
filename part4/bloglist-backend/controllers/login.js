const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

// 4.18: autenticacao por token
loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  const user = await User.findOne({ username })

  // Se o usuario nao existe, nao chamamos o bcrypt - mas respondemos
  // a mesma mensagem generica, para nao revelar quais usuarios existem.
  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return response.status(401).json({ error: 'invalid username or password' })
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  }

  // O token expira em 1 hora. Quanto menor o prazo, menor a janela
  // de uso caso ele vaze.
  const token = jwt.sign(userForToken, process.env.SECRET, {
    expiresIn: 60 * 60,
  })

  response.status(200).send({
    token,
    username: user.username,
    name: user.name,
  })
})

module.exports = loginRouter
