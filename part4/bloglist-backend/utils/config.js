require('dotenv').config()

const PORT = process.env.PORT || 3003

// Em modo de teste usamos um banco separado, para que os testes
// possam limpar as colecoes sem destruir dados de desenvolvimento.
const MONGODB_URI =
  process.env.NODE_ENV === 'test'
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI

module.exports = {
  MONGODB_URI,
  PORT,
}
