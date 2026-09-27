/*
 * Exercicio 3.12 - programa de linha de comando.
 *
 * Uso:
 *   node mongo.js <senha>                      lista todas as entradas
 *   node mongo.js <senha> <nome> <numero>      adiciona uma entrada
 *
 * Nomes com espaco precisam de aspas:
 *   node mongo.js senha "Arto Hellas" 040-123456
 */

const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('informe a senha como argumento: node mongo.js <senha>')
  process.exit(1)
}

const password = process.argv[2]

// Substitua <usuario> e <cluster> pelos seus valores do MongoDB Atlas
const url = `mongodb+srv://<usuario>:${password}@<cluster>.mongodb.net/phonebookApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

const run = async () => {
  await mongoose.connect(url)

  // Sem nome e numero: apenas lista
  if (process.argv.length === 3) {
    const persons = await Person.find({})
    console.log('phonebook:')
    persons.forEach((person) => {
      console.log(person.name, person.number)
    })
    await mongoose.connection.close()
    return
  }

  if (process.argv.length < 5) {
    console.log('informe nome e numero: node mongo.js <senha> <nome> <numero>')
    await mongoose.connection.close()
    process.exit(1)
  }

  const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  })

  await person.save()
  console.log(`added ${person.name} number ${person.number} to phonebook`)

  await mongoose.connection.close()
}

run()
