# Phonebook backend — Full Stack Open, parte 3

Exercícios **3.1 a 3.22**. Back-end da lista telefônica com MongoDB.

> O material recomenda repositório separado com o código na raiz (por causa do
> deploy, ex. 3.10). Aqui está em `part3/` para seguir o padrão deste repo;
> mova para um repositório próprio antes de implantar.

## Configuração

```bash
npm install
cp .env.example .env     # preencha MONGODB_URI

npm run dev              # nodemon
npm start
npm run lint             # eslint (3.22)
```

## Exercícios

| Ex. | O que faz | Onde |
|-----|-----------|------|
| 3.1 | `GET /api/persons` | `index.js` |
| 3.2 | `GET /info` com data e total | `index.js` |
| 3.3 | `GET /api/persons/:id` com 404 | `index.js` |
| 3.4 | `DELETE /api/persons/:id` → 204 | `index.js` |
| 3.5 | `POST` com id aleatório | `index.js` |
| 3.6 | Erros de nome/número → 400 | `index.js` |
| 3.7 | Morgan `tiny` | `index.js` |
| 3.8 | Morgan mostrando o corpo do POST | `morgan.token('body')` |
| 3.9–3.10 | Front-end da parte 2 + deploy | `cors`, plataforma externa |
| 3.11 | Servir o build estático | `express.static('dist')` |
| 3.12 | Programa de linha de comando | `mongo.js` |
| 3.13 | Listar do banco | `Person.find({})` |
| 3.14 | Salvar no banco | `person.save()` |
| 3.15 | Excluir do banco | `findByIdAndDelete` |
| 3.16 | Middleware de erro | `errorHandler` |
| 3.17 | `PUT` para atualizar o número | `findByIdAndUpdate` |
| 3.18 | `/info` e busca individual do banco | `countDocuments`, `findById` |
| 3.19 | Nome com no mínimo 3 caracteres | `models/person.js` |
| 3.20 | Formato do número validado | `numberValidator` |
| 3.21 | Deploy da versão com banco | plataforma externa |
| 3.22 | ESLint | `.eslintrc.js` |

## Pontos de atenção

**`express.json()` antes do morgan.** Caso contrário `request.body` ainda não
existe quando o token `:body` é avaliado, e o log do 3.8 sai vazio.

**`runValidators` no PUT (3.17).** O Mongoose não aplica validações do schema
em updates por padrão. Sem `{ runValidators: true, context: 'query' }` seria
possível gravar um número inválido pelo `PUT`.

**O `.env` não vai para o Git.** Está no `.gitignore`; use o `.env.example`
como referência. Na plataforma de deploy, defina as variáveis no painel.

**`mongo.js` (3.12).** Substitua `<usuario>` e `<cluster>` pelos seus valores
do MongoDB Atlas antes de usar.

```bash
node mongo.js <senha>                      # lista
node mongo.js <senha> "Arto Hellas" 040-123456   # adiciona
```

## Conectando o front-end (3.9–3.11)

No front-end da parte 2, aponte o `baseUrl` do serviço para `/api/persons`
(caminho relativo). Depois:

```bash
npm run build:ui     # gera o build e copia para dist/
```

O `express.static('dist')` passa a servir o front-end na raiz.
