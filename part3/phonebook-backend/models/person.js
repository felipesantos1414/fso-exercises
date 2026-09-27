const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose
  .connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

// 3.20: o numero deve ter ao menos 8 caracteres e ser formado por duas
// partes separadas por "-": 2 ou 3 digitos, depois so digitos.
// Ex.: 09-1234556 ou 040-22334455
const numberValidator = {
  validator: (value) => /^\d{2,3}-\d+$/.test(value),
  message: (props) =>
    `${props.value} nao e um numero valido. Use o formato 09-1234556 ou 040-22334455`,
}

const personSchema = new mongoose.Schema({
  // 3.19: nome com no minimo 3 caracteres
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    minLength: 8,
    required: true,
    validate: numberValidator,
  },
})

// Converte _id (ObjectId) em id (string) e remove campos internos
personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Person', personSchema)
