const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

// 4.8 + 4.17: lista com os dados do criador embutidos via populate
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id).populate('user', {
    username: 1,
    name: 1,
  })

  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

// 4.10 + 4.19: criacao exige token valido; o usuario do token vira o criador
blogsRouter.post('/', async (request, response) => {
  const { title, author, url, likes } = request.body

  // request.user vem do middleware userExtractor
  const user = request.user
  if (!user) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const blog = new Blog({
    title,
    author,
    url,
    // 4.11: default 0 quando likes nao vem na requisicao
    likes: likes === undefined ? 0 : likes,
    user: user._id,
  })

  // 4.12: title ou url ausentes disparam ValidationError do schema,
  // que o errorHandler converte em 400
  const savedBlog = await blog.save()

  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  await savedBlog.populate('user', { username: 1, name: 1 })

  response.status(201).json(savedBlog)
})

// 4.13 + 4.21: so o criador pode excluir
blogsRouter.delete('/:id', async (request, response) => {
  const user = request.user
  if (!user) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const blog = await Blog.findById(request.params.id)
  if (!blog) {
    return response.status(204).end()
  }

  // blog.user e um ObjectId, nao uma string: a conversao com
  // toString() e obrigatoria para a comparacao funcionar
  if (blog.user && blog.user.toString() !== user._id.toString()) {
    return response.status(403).json({ error: 'only the creator can delete a blog' })
  }

  await Blog.findByIdAndDelete(request.params.id)

  user.blogs = user.blogs.filter((id) => id.toString() !== request.params.id)
  await user.save()

  response.status(204).end()
})

// 4.14: atualizacao (tipicamente o numero de likes)
blogsRouter.put('/:id', async (request, response) => {
  const { title, author, url, likes } = request.body

  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    { title, author, url, likes },
    { new: true, runValidators: true, context: 'query' }
  ).populate('user', { username: 1, name: 1 })

  if (updatedBlog) {
    response.json(updatedBlog)
  } else {
    response.status(404).end()
  }
})

module.exports = blogsRouter
