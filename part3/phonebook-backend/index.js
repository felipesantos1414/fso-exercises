require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const Person = require('./models/person')

const app = express()

// ---------------------------------------------------------------------------
// Middlewares
// ---------------------------------------------------------------------------

app.use(cors())

// 3.11: serve o build do front-end da parte 2
app.use(express.static('dist'))

// Precisa vir antes do morgan para que request.body exista no token :body
app.use(express.json())

// 3.8: token personalizado com o corpo do POST
morgan.token('body', (request) => {
  if (request.method !== 'POST') {
    return ''
  }
  return JSON.stringify(request.body)
})

app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body')
)

// ---------------------------------------------------------------------------
// Rotas
// ---------------------------------------------------------------------------

// 3.13: lista vinda do banco
app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then((persons) => {
      response.json(persons)
    })
    .catch((error) => next(error))
})

// 3.18: /info usando o banco
app.get('/info', (request, response, next) => {
  Person.countDocuments({})
    .then((total) => {
      const now = new Date()
      response.send(`
        <p>Phonebook has info for ${total} people</p>
        <p>${now}</p>
      `)
    })
    .catch((error) => next(error))
})

// 3.18: busca individual pelo id do Mongo
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})

// 3.15: exclusao no banco
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

// 3.14 + 3.19 + 3.20: criacao com validacao pelo schema
app.post('/api/persons', (request, response, next) => {
  const body = request.body

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person
    .save()
    .then((savedPerson) => {
      response.status(201).json(savedPerson)
    })
    .catch((error) => next(error))
})

// 3.17: atualiza o numero de uma entrada existente
// runValidators + context garantem que as validacoes do schema tambem
// rodem no update (por padrao o Mongoose nao as aplica)
app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then((updatedPerson) => {
      if (updatedPerson) {
        response.json(updatedPerson)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})

// ---------------------------------------------------------------------------
// Middlewares finais (depois das rotas)
// ---------------------------------------------------------------------------

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

// 3.16 + 3.19 + 3.20: tratamento centralizado de erros.
// Recebe QUATRO parametros - e isso que o diz ao Express que
// este middleware trata erros.
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

// ---------------------------------------------------------------------------

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
