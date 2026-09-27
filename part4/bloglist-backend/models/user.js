const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  // 4.16: username obrigatorio, unico e com no minimo 3 caracteres.
  // A unicidade tambem depende de um indice unico no Mongo.
  username: {
    type: String,
    required: true,
    unique: true,
    minLength: 3,
  },
  name: String,
  // Guardamos o hash, nunca a senha. A validacao de tamanho da senha
  // acontece no controller, porque o que chega aqui ja e o hash.
  passwordHash: {
    type: String,
    required: true,
  },
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
    },
  ],
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    // o hash nunca deve ser exposto pela API
    delete returnedObject.passwordHash
  },
})

module.exports = mongoose.model('User', userSchema)
