# Phonebook backend — Full Stack Open, parte 3

Backend da lista telefônica. Exercícios **3.1 a 3.8** implementados.

> **Atenção:** o material recomenda que os exercícios da parte 3 fiquem em um
> **repositório Git separado, com o código na raiz**, por causa do exercício 3.10
> (deploy). Aqui está dentro de `part3/` para seguir o padrão do repositório de
> exercícios. Antes de fazer o deploy, mova este diretório para um repositório
> próprio.

## Como rodar

```bash
npm install
npm run dev     # com nodemon, reinicia a cada alteração
npm start       # execução simples
```

Servidor em `http://localhost:3001`.

## Exercícios implementados

| Ex. | O que faz | Onde |
|-----|-----------|------|
| 3.1 | `GET /api/persons` devolve a lista | rota `app.get('/api/persons')` |
| 3.2 | `GET /info` com data/hora e total de entradas | rota `app.get('/info')` |
| 3.3 | `GET /api/persons/:id`, com **404** se não existir | rota com parâmetro |
| 3.4 | `DELETE /api/persons/:id` respondendo **204** | `app.delete` |
| 3.5 | `POST /api/persons` com id via `Math.random` | `generateId()` |
| 3.6 | Erros: nome ou número faltando, nome duplicado → **400** | validações no `post` |
| 3.7 | Morgan no formato `tiny` | `app.use(morgan(...))` |
| 3.8 | Morgan mostrando o corpo do POST | `morgan.token('body', ...)` |

## Endpoints

| Método | URL | Resposta |
|--------|-----|----------|
| GET | `/api/persons` | 200 + array JSON |
| GET | `/info` | 200 + HTML |
| GET | `/api/persons/:id` | 200 + objeto, ou 404 |
| DELETE | `/api/persons/:id` | 204 |
| POST | `/api/persons` | 201 + objeto criado, ou 400 + `{ error }` |
| qualquer | rota inexistente | 404 + `{ error: 'unknown endpoint' }` |

## Detalhes de implementação

**Ordem dos middlewares.** `express.json()` vem **antes** do morgan. Se a ordem
fosse invertida, `request.body` ainda estaria `undefined` quando o token `:body`
fosse avaliado, e o log do exercício 3.8 sairia vazio.

**Exercício 3.8.** A solução usa um token personalizado que serializa o corpo com
`JSON.stringify`. O token devolve string vazia fora do POST — o morgan renderiza
isso como `-` nas linhas de GET e DELETE, o que é esperado.

**Id numérico.** `request.params.id` chega sempre como **string**; por isso a
conversão com `Number()` antes de comparar com `===`.

**`return` nas validações.** Cada `response.status(400)` é precedido de `return`.
Sem ele a execução continuaria e a entrada inválida seria salva mesmo assim.

## Testando

Os arquivos em `requests/` funcionam com a extensão **REST Client** do VS Code
(clique em *Send Request*). Alternativa via terminal:

```bash
curl http://localhost:3001/api/persons

curl -X POST http://localhost:3001/api/persons \
  -H "Content-Type: application/json" \
  -d '{"name":"Felipe","number":"55-11-99999"}'

curl -X DELETE http://localhost:3001/api/persons/1
```

## Próximos passos

- **3.9–3.11** — conectar o front-end da parte 2, adicionar `cors`, servir o build
  estático e fazer o deploy.
- **3.12–3.18** — substituir o array em memória por MongoDB (Mongoose).
- **3.19–3.22** — validação com Mongoose e ESLint.
