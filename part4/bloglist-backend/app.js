const config = require('./utils/config')
const express = require('express')
// Deve ser exigido ANTES das rotas: e o que faz excecoes lancadas em
// handlers async chegarem ao errorHandler sem try/catch.
require('express-async-errors')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')

const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')

mongoose.set('strictQuery', false)

logger.info('connecting to', config.MONGODB_URI)

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message)
  })

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)

// 4.22: userExtractor roda apenas na rota de blogs, que e a unica
// que precisa saber quem e o usuario autenticado.
app.use('/api/blogs', middleware.userExtractor, blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

// Depois de todas as rotas
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
