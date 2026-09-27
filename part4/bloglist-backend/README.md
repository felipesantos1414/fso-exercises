# Bloglist backend — Full Stack Open, parte 4

Exercícios **4.1 a 4.23**. Back-end da lista de blogs com testes e autenticação
por token.

## Configuração

```bash
npm install
cp .env.example .env     # preencha MONGODB_URI, TEST_MONGODB_URI e SECRET
```

O `SECRET` pode ser qualquer string longa e aleatória — é o que assina os
tokens. Use **bancos diferentes** para desenvolvimento e teste: os testes
apagam todas as coleções antes de cada caso.

```bash
npm run dev      # desenvolvimento (nodemon)
npm start        # produção
npm test         # todos os testes
npm run lint     # eslint
```

Servidor em `http://localhost:3003`.

## Estrutura

```
index.js              inicia o servidor
app.js                monta a aplicação Express
controllers/
  blogs.js            rotas de /api/blogs
  users.js            rotas de /api/users
  login.js            rota de /api/login
models/
  blog.js             schema do Blog
  user.js             schema do User
utils/
  config.js           variáveis de ambiente
  logger.js           logs centralizados
  middleware.js       middlewares próprios
  list_helper.js      funções auxiliares (4.3–4.7)
tests/
  list_helper.test.js testes unitários
  blog_api.test.js    testes de integração da API de blogs
  user_api.test.js    testes de usuários e login
  test_helper.js      dados iniciais e inspeção do banco
  teardown.js         encerra o processo ao fim do Jest
```

## Exercícios

| Ex. | O que faz | Onde |
|-----|-----------|------|
| 4.1–4.2 | Projeto npm e refatoração em módulos | estrutura acima |
| 4.3 | `dummy` | `utils/list_helper.js` |
| 4.4 | `totalLikes` | `utils/list_helper.js` |
| 4.5 | `favoriteBlog` | `utils/list_helper.js` |
| 4.6 | `mostBlogs` | `utils/list_helper.js` |
| 4.7 | `mostLikes` | `utils/list_helper.js` |
| 4.8 | Teste GET `/api/blogs` + async/await | `tests/blog_api.test.js` |
| 4.9 | Identificador chamado `id` | `blogSchema.set('toJSON')` |
| 4.10 | Teste de POST | `tests/blog_api.test.js` |
| 4.11 | `likes` com padrão 0 | `models/blog.js` |
| 4.12 | `title`/`url` obrigatórios → 400 | `models/blog.js` |
| 4.13 | DELETE | `controllers/blogs.js` |
| 4.14 | PUT (atualizar likes) | `controllers/blogs.js` |
| 4.15 | Criação de usuário com bcrypt | `controllers/users.js` |
| 4.16 | Validação de username e senha | `controllers/users.js` |
| 4.17 | Blog com usuário + `populate` | `controllers/blogs.js` |
| 4.18 | Login com JWT | `controllers/login.js` |
| 4.19 | POST exige token válido | `controllers/blogs.js` |
| 4.20 | Middleware `tokenExtractor` | `utils/middleware.js` |
| 4.21 | Só o criador pode excluir | `controllers/blogs.js` |
| 4.22 | Middleware `userExtractor` | `utils/middleware.js` |
| 4.23 | Teste de 401 sem token | `tests/blog_api.test.js` |

## Endpoints

| Método | URL | Token | Resposta |
|--------|-----|-------|----------|
| GET | `/api/blogs` | não | 200 + array |
| POST | `/api/blogs` | **sim** | 201, ou 400 / 401 |
| PUT | `/api/blogs/:id` | não | 200, 400 ou 404 |
| DELETE | `/api/blogs/:id` | **sim** | 204, 401 ou 403 |
| GET | `/api/users` | não | 200 + usuários com seus blogs |
| POST | `/api/users` | não | 201, ou 400 |
| POST | `/api/login` | não | 200 + token, ou 401 |

## Pontos de atenção

**Ordem dos middlewares em `app.js`.** `express.json()` → `requestLogger` →
`tokenExtractor` → rotas → `unknownEndpoint` → `errorHandler`. Trocar a ordem
quebra silenciosamente: o logger imprimiria `body` vazio, e o `errorHandler`
nunca seria alcançado se registrado antes das rotas.

**`express-async-errors`.** Exigido no topo de `app.js`, **antes** das rotas.
É o que elimina os `try/catch` — sem ele, uma exceção em handler `async` vira
*unhandled promise rejection* e a requisição fica sem resposta.

**Comparar ids.** `blog.user` é um `ObjectId`, não string. A comparação exige
`.toString()` nos dois lados, senão o teste de propriedade do 4.21 sempre falha.

**Validação de senha fora do schema.** O schema recebe o *hash*, não a senha —
validar tamanho ali testaria a coisa errada. Por isso a checagem está no
controller.

**`runValidators` no PUT.** Por padrão o Mongoose **não** aplica as validações
do schema em updates. Sem `{ runValidators: true, context: 'query' }` daria
para gravar um blog inválido via PUT.

## Testando manualmente

Arquivos em `requests/` para a extensão REST Client do VS Code. Ordem:
crie um usuário (`users.rest`), faça login (`login.rest`), copie o token para
a variável no topo de `blogs.rest`.
