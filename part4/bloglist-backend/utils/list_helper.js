// Exercicios 4.3 a 4.7

// 4.3
const dummy = () => {
  return 1
}

// 4.4: soma de todos os likes
const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

// 4.5: o blog com mais likes.
// Devolve null para lista vazia; em caso de empate, o primeiro encontrado.
const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const best = blogs.reduce((melhor, blog) =>
    blog.likes > melhor.likes ? blog : melhor
  )

  return {
    title: best.title,
    author: best.author,
    likes: best.likes,
  }
}

// Agrupa os blogs por autor somando um valor calculado por blog.
// Usado tanto por mostBlogs (soma 1 por blog) quanto por
// mostLikes (soma os likes).
const topAuthorBy = (blogs, valueOf) => {
  const totals = new Map()

  blogs.forEach((blog) => {
    const atual = totals.get(blog.author) || 0
    totals.set(blog.author, atual + valueOf(blog))
  })

  let autorTop = null
  let valorTop = -Infinity

  totals.forEach((valor, autor) => {
    if (valor > valorTop) {
      autorTop = autor
      valorTop = valor
    }
  })

  return { author: autorTop, value: valorTop }
}

// 4.6: autor com mais posts
const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const { author, value } = topAuthorBy(blogs, () => 1)
  return { author, blogs: value }
}

// 4.7: autor com mais likes somados
const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const { author, value } = topAuthorBy(blogs, (blog) => blog.likes)
  return { author, likes: value }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}
