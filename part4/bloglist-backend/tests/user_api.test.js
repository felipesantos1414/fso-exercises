const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')

const app = require('../app')
const helper = require('./test_helper')
const User = require('../models/user')

const api = supertest(app)

describe('quando ha um usuario inicial no banco', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', name: 'Superuser', passwordHash })
    await user.save()
  })

  // 4.15
  test('a criacao funciona com um username novo', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'felipesantos',
      name: 'Felipe Santos',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map((u) => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('a senha nunca e devolvida pela API', async () => {
    const response = await api
      .post('/api/users')
      .send({ username: 'semhash', name: 'Teste', password: 'segredo' })
      .expect(201)

    expect(response.body.passwordHash).toBeUndefined()
    expect(response.body.password).toBeUndefined()
  })

  // 4.16
  test('falha com 400 se o username ja existe', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Duplicado',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('expected `username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })

  test('falha com 400 se o username tiver menos de 3 caracteres', async () => {
    const result = await api
      .post('/api/users')
      .send({ username: 'ab', name: 'Curto', password: 'salainen' })
      .expect(400)

    expect(result.body.error).toContain('at least 3 characters')
  })

  test('falha com 400 se a senha tiver menos de 3 caracteres', async () => {
    const result = await api
      .post('/api/users')
      .send({ username: 'valido', name: 'Senha curta', password: 'ab' })
      .expect(400)

    expect(result.body.error).toContain('at least 3 characters')
  })

  test('falha com 400 se username ou senha nao forem enviados', async () => {
    await api.post('/api/users').send({ name: 'Sem nada' }).expect(400)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(1)
  })
})

describe('login', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', name: 'Superuser', passwordHash })
    await user.save()
  })

  test('devolve um token com credenciais corretas', async () => {
    const response = await api
      .post('/api/login')
      .send({ username: 'root', password: 'sekret' })
      .expect(200)

    expect(response.body.token).toBeDefined()
    expect(response.body.username).toBe('root')
  })

  test('falha com 401 se a senha estiver errada', async () => {
    const response = await api
      .post('/api/login')
      .send({ username: 'root', password: 'errada' })
      .expect(401)

    expect(response.body.error).toContain('invalid username or password')
  })

  test('falha com 401 se o usuario nao existir', async () => {
    await api
      .post('/api/login')
      .send({ username: 'ninguem', password: 'sekret' })
      .expect(401)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})
