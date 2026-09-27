const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')

const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

let token = null

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  // Cria um usuario e faz login uma vez, guardando o token para
  // as operacoes que exigem autenticacao.
  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', name: 'Superuser', passwordHash })
  await user.save()

  const loginResponse = await api
    .post('/api/login')
    .send({ username: 'root', password: 'sekret' })

  token = loginResponse.body.token

  // Os blogs iniciais pertencem a esse mesmo usuario
  const blogObjects = helper.initialBlogs.map(
    (blog) => new Blog({ ...blog, user: user._id })
  )
  const savedBlogs = await Blog.insertMany(blogObjects)

  user.blogs = savedBlogs.map((blog) => blog._id)
  await user.save()
})

describe('quando ja existem blogs salvos', () => {
  // 4.8
  test('os blogs sao retornados como json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('a quantidade de blogs esta correta', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  // 4.9
  test('o identificador se chama id, nao _id', async () => {
    const response = await api.get('/api/blogs')

    const blog = response.body[0]
    expect(blog.id).toBeDefined()
    expect(blog._id).toBeUndefined()
  })
})

describe('adicao de um novo blog', () => {
  // 4.10
  test('funciona com dados validos e token', async () => {
    const newBlog = {
      title: 'Type wars',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
      likes: 2,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map((blog) => blog.title)
    expect(titles).toContain('Type wars')
  })

  // 4.23
  test('falha com 401 se o token nao for fornecido', async () => {
    const newBlog = {
      title: 'Sem token',
      author: 'Anonimo',
      url: 'http://exemplo.com',
      likes: 1,
    }

    await api.post('/api/blogs').send(newBlog).expect(401)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  // 4.11
  test('likes recebe 0 por padrao quando ausente', async () => {
    const newBlog = {
      title: 'Sem likes',
      author: 'Alguem',
      url: 'http://exemplo.com/sem-likes',
    }

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)

    expect(response.body.likes).toBe(0)
  })

  // 4.12
  test('falha com 400 se title estiver faltando', async () => {
    const newBlog = { author: 'Alguem', url: 'http://exemplo.com', likes: 1 }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('falha com 400 se url estiver faltando', async () => {
    const newBlog = { title: 'Sem url', author: 'Alguem', likes: 1 }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })
})

describe('exclusao de um blog', () => {
  // 4.13
  test('funciona com 204 quando o id e valido e o usuario e o criador', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

    const titles = blogsAtEnd.map((blog) => blog.title)
    expect(titles).not.toContain(blogToDelete.title)
  })

  // 4.21
  test('falha com 401 sem token', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(401)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('falha com 403 se quem pede nao e o criador', async () => {
    // Cria um segundo usuario e usa o token dele
    const passwordHash = await bcrypt.hash('outra', 10)
    const outro = new User({ username: 'intruso', passwordHash })
    await outro.save()

    const loginResponse = await api
      .post('/api/login')
      .send({ username: 'intruso', password: 'outra' })

    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
      .expect(403)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })
})

describe('atualizacao de um blog', () => {
  // 4.14
  test('atualiza o numero de likes', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send({ ...blogToUpdate, likes: blogToUpdate.likes + 10 })
      .expect(200)

    expect(response.body.likes).toBe(blogToUpdate.likes + 10)
  })

  test('devolve 404 para um id valido mas inexistente', async () => {
    const validNonexistingId = await helper.nonExistingId()

    await api
      .put(`/api/blogs/${validNonexistingId}`)
      .send({ title: 'x', url: 'http://x.com', likes: 1 })
      .expect(404)
  })

  test('devolve 400 para um id malformado', async () => {
    await api.put('/api/blogs/id-invalido').send({ likes: 1 }).expect(400)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})
