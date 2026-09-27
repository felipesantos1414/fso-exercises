// Centralizar os logs permite mudar o destino (arquivo, servico externo)
// em um unico lugar. Em modo de teste ficamos em silencio para nao
// poluir a saida do Jest.
const info = (...params) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(...params)
  }
}

const error = (...params) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error(...params)
  }
}

module.exports = { info, error }
