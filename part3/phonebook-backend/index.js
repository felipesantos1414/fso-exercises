const express = require('express')
const morgan = require('morgan')

const app = express()

// ---------------------------------------------------------------------------
// Middlewares
// ---------------------------------------------------------------------------

// Precisa vir ANTES do morgan, senao request.body ainda nao existe
// quando o token :body for avaliado (exercicio 3.8).
app.use(express.json())

// 3.8: token personalizado que imprime o corpo da requisicao.
// Em requisicoes sem corpo (GET, DELETE) retornamos string vazia para
// nao poluir o log com "{}".
morgan.token('body', (request) => {
  if (request.method !== 'POST') {
    return ''
  }
  return JSON.stringify(request.body)
})

// 3.7 + 3.8: formato "tiny" acrescido do token :body.
// tiny = :method :url :status :res[content-length] - :response-time ms
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body')
)

// ---------------------------------------------------------------------------
// Dados em memoria (serao substituidos pelo MongoDB no exercicio 3.12+)
// ---------------------------------------------------------------------------

let persons = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: 4,
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
]

// ---------------------------------------------------------------------------
// Rotas
// ---------------------------------------------------------------------------

// 3.1: lista completa
app.get('/api/persons', (request, response) => {
  response.json(persons)
})

// 3.2: pagina de informacoes
app.get('/info', (request, response) => {
  const total = persons.length
  const now = new Date()

  response.send(`
    <p>Phonebook has info for ${total} people</p>
    <p>${now}</p>
  `)
})

// 3.3: uma unica entrada
app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find((p) => p.id === id)

  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

// 3.4: exclusao
app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter((p) => p.id !== id)

  response.status(204).end()
})

// 3.5: geracao de id aleatorio com intervalo grande o bastante
// para tornar colisoes improvaveis
const generateId = () => {
  return Math.floor(Math.random() * 1_000_000_000)
}

// 3.5 + 3.6: criacao com tratamento de erro
app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({ error: 'name missing' })
  }

  if (!body.number) {
    return response.status(400).json({ error: 'number missing' })
  }

  const nameTaken = persons.some((p) => p.name === body.name)
  if (nameTaken) {
    return response.status(400).json({ error: 'name must be unique' })
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  }

  persons = persons.concat(person)

  response.status(201).json(person)
})

// ---------------------------------------------------------------------------
// Endpoint desconhecido (depois de todas as rotas)
// ---------------------------------------------------------------------------

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

// ---------------------------------------------------------------------------

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
