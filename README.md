# 🌍 API Viagem

Uma API  completa para gerenciar e organizar viagens, com funcionalidades para criar, atualizar, listar e deletar viagens, além de gerenciar destinos, hospedagens e despesas relacionadas.

## ✨ Características

- ✅ CRUD completo de viagens
- ✅ Gerenciamento de destinos
- ✅ Controle de hospedagens
- ✅ Rastreamento de despesas
- ✅ Autenticação de usuários
- ✅ Validação de dados
- ✅ Tratamento de erros robusto

## 🛠️ Tecnologias Utilizadas

- **Backend**: Node.js com Express.js
- **Banco de Dados**: MySQL
- **ORM**: Prisma
- **Autenticação**: JWT (JSON Web Tokens)


## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/luiszr21/API-Viagem.git
cd API-Viagem
```

### 2. Instale as dependências

```bash
npm install
```


### 4. Inicie o servidor

```bash
npm start
```

O servidor estará rodando em `http://localhost:3000`

## 📚 Endpoints da API

### Autenticação

```
POST   /api/auth/register      - Registrar novo usuário
POST   /api/auth/login         - Fazer login
POST   /api/auth/logout        - Fazer logout
```

### Viagens

```
GET    /api/viagens            - Listar todas as viagens
GET    /api/viagens/:id        - Obter detalhes de uma viagem
POST   /api/viagens            - Criar nova viagem
PUT    /api/viagens/:id        - Atualizar uma viagem
DELETE /api/viagens/:id        - Deletar uma viagem
```

### Destinos

```
GET    /api/destinos           - Listar todos os destinos
GET    /api/destinos/:id       - Obter detalhes de um destino
POST   /api/destinos           - Criar novo destino
PUT    /api/destinos/:id       - Atualizar um destino
DELETE /api/destinos/:id       - Deletar um destino
```

### Hospedagens

```
GET    /api/hospedagens        - Listar todas as hospedagens
POST   /api/hospedagens        - Criar nova hospedagem
PUT    /api/hospedagens/:id    - Atualizar uma hospedagem
DELETE /api/hospedagens/:id    - Deletar uma hospedagem
```

### Despesas

```
GET    /api/despesas           - Listar todas as despesas
POST   /api/despesas           - Registrar nova despesa
PUT    /api/despesas/:id       - Atualizar uma despesa
DELETE /api/despesas/:id       - Deletar uma despesa
```

## 📝 Exemplo de Uso

### Registrar um novo usuário

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@example.com",
    "senha": "senha123"
  }'
```

### Criar uma nova viagem

```bash
curl -X POST http://localhost:3000/api/viagens \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Viagem para Paris",
    "destino": "Paris, França",
    "dataInicio": "2024-07-01",
    "dataFim": "2024-07-15",
    "orcamento": 5000
  }'
```



## 🔐 Segurança

- Todas as senhas são criptografadas usando bcrypt
- Autenticação baseada em JWT
- Validação de entrada em todos os endpoints

- Rate limiting implementado para prevenir abuso

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request
