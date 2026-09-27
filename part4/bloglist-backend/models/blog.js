const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
  // 4.12: title e url sao obrigatorios
  title: {
    type: String,
    required: true,
  },
  author: String,
  url: {
    type: String,
    required: true,
  },
  // 4.11: likes recebe 0 por padrao quando ausente
  likes: {
    type: Number,
    default: 0,
  },
  // 4.17: referencia ao usuario que criou o blog
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
})

// 4.9: o identificador se chama id (string), nao _id
blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Blog', blogSchema)
