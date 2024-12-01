Abaixo está a documentação atualizada no `README.md` considerando todas as alterações e implementações feitas:

---

# MTG Deck API - Documentação Completa

## Sumário

1. [Descrição Geral](#descrição-geral)
2. [Dependências e Configurações](#dependências-e-configurações)
3. [Rotas Principais](#rotas-principais)
4. [Notificações em Tempo Real](#notificações-em-tempo-real)
5. [Fila de Mensageria com RabbitMQ](#fila-de-mensageria-com-rabbitmq)
6. [Utilização de Clusters](#utilização-de-clusters)
7. [Como Rodar o Projeto](#como-rodar-o-projeto)

---

## Descrição Geral

Esta API foi desenvolvida para gerenciar cards e decks de Magic: The Gathering no formato **Commander**. A aplicação suporta:

- Criação e listagem de decks.
- Importação de decks via JSON.
- Notificações em tempo real com **WebSocket**.
- Gerenciamento de filas de tarefas com **RabbitMQ**.
- Cacheamento com **Redis**.
- Execução com clusters para melhor performance.

---

## Dependências e Configurações

### Banco de Dados
- **MongoDB**: Utilizado para persistir cards e decks.
  - URL padrão: `mongodb://localhost:27017/mtg-api`.

### Mensageria
- **RabbitMQ**: Para processamento de mensagens.
  - URL padrão: `amqp://localhost`.

### Cache
- **Redis**: Utilizado para cachear dados.
  - URL padrão: `redis://localhost`.

### Socket.IO
- Configurado para notificar usuários em tempo real.

---

## Rotas Principais

### Autenticação

- **`POST /login`**  
  Retorna um token JWT para autenticação.

- **`POST /register`**  
  Registra um novo usuário.

### Cards

- **`GET /cards`**  
  Retorna todos os cards cadastrados.

- **`POST /cards-create`**  
  Cria um novo card (necessário autenticação).

- **`GET /inserir-cards`**  
  Insere cards diretamente da API externa do Magic: The Gathering (necessário autenticação).

### Decks

- **`POST /decks`**  
  Cria um novo deck (necessário autenticação).

- **`GET /decks/:id`**  
  Retorna detalhes de um deck específico (necessário autenticação).

- **`GET /my-decks`**  
  Retorna todos os decks do usuário logado (necessário autenticação e implementa cache).

- **`POST /decks/import`**  
  Importa decks no formato JSON, validando regras do formato Commander (utiliza filas com RabbitMQ).

- **`PUT /decks/:id`**  
  Atualiza informações de um deck existente (necessário autenticação).

- **`GET /decks/all`**  
  Lista todos os decks (apenas para administradores).

### Notificações

- **`POST /test-notification`**  
  Envia uma notificação de teste para um usuário específico.

---

## Notificações em Tempo Real

A integração com **Socket.IO** permite que os usuários recebam notificações sobre eventos como importação de decks. Para testar:

1. Abra o arquivo `test-socket.html`.
2. Insira o **User ID** no campo apropriado.
3. Clique em "Connect".
4. As notificações aparecerão na interface.

---

## Fila de Mensageria com RabbitMQ

A API utiliza filas para processar tarefas assíncronas, como a importação de decks. Mensagens são enviadas para as seguintes filas:

- **`deck_import_queue`**: Para processar importações de decks.
- **`deck_updates_queue`**: Para enviar atualizações de status após o processamento.

---

## Utilização de Clusters

Clusters são usados para distribuir a carga em múltiplos núcleos da CPU, melhorando a performance da aplicação. O número de clusters é baseado no número de CPUs disponíveis.

---

## Como Rodar o Projeto

### 1. Clonar o Repositório
```bash
git clone <URL_DO_REPOSITORIO>
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Iniciar Serviços
- MongoDB:
  ```bash
  mongod
  ```
- Redis:
  ```bash
  redis-server
  ```
- RabbitMQ:
  ```bash
  docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
  ```

### 4. Rodar a Aplicação
Para rodar em modo cluster:
```bash
npm start
```

### 5. Exemplos de Rotas e Uso no Insomnia

#### 5.1 Importação de Deck (`POST /decks/import`)

##### Descrição:
Importa um deck no formato JSON e valida as regras do formato Commander. O processamento ocorre de forma assíncrona com notificações em tempo real.

##### Exemplo de Configuração no Insomnia:

1. **Método**: `POST`
2. **URL**: `http://localhost:3001/decks/import`
3. **Headers**:
   ```json
   {
       "Authorization": "Bearer <SEU_TOKEN_JWT>",
       "Content-Type": "application/json"
   }
   ```
4. **Body (JSON)**:
   ```json
   {
       "commanderId": "674b76bdd5a9a4495f0361f2",
       "cardIds": [
           "674b76bdd5a9a4495f0361cb",
           "674b76bdd5a9a4495f0361cf",
           "674b76bdd5a9a4495f0361d3",
           "674b76bdd5a9a4495f0361d7",
           "674b76bdd5a9a4495f0361da",
           "674b76bdd5a9a4495f0361de",
           "674b76bdd5a9a4495f0361e1",
           "674b76bdd5a9a4495f0361e5",
           "674b76bdd5a9a4495f0361e8",
           "674b76bdd5a9a4495f0361eb",
           "674b76bdd5a9a4495f0361ee",
           "674b76bdd5a9a4495f0361f5",
           "674b76bdd5a9a4495f0361f8",
           "674b76bdd5a9a4495f0361fb",
           "674b76bdd5a9a4495f0361ff",
           "674b76bdd5a9a4495f036202",
           "674b76bdd5a9a4495f036205",
           "674b76bdd5a9a4495f036208",
           "674b76bdd5a9a4495f03620c",
           "674b76bdd5a9a4495f03620f",
           "674b76bdd5a9a4495f036212",
           "674b76bdd5a9a4495f036216",
           "674b76bdd5a9a4495f036219",
           "674b76bdd5a9a4495f03621c",
           "674b76bdd5a9a4495f03621f",
           "674b76bdd5a9a4495f036222",
           "674b76bdd5a9a4495f036225",
           "674b76bdd5a9a4495f036228",
           "674b76bdd5a9a4495f03622c",
           "674b76bdd5a9a4495f036230",
           "674b76bdd5a9a4495f036234",
           "674b76bdd5a9a4495f036238",
           "674b76bdd5a9a4495f03623c",
           "674b76bdd5a9a4495f03623f",
           "674b76bdd5a9a4495f036243",
           "674b76bdd5a9a4495f036246",
           "674b76bdd5a9a4495f036249",
           "674b76bdd5a9a4495f03624c",
           "674b76bdd5a9a4495f036250",
           "674b76bdd5a9a4495f036254",
           "674b76bdd5a9a4495f036258",
           "674b76bdd5a9a4495f03625c",
           "674b76bdd5a9a4495f036260",
           "674b76bdd5a9a4495f036263",
           "674b76bdd5a9a4495f036267",
           "674b76bdd5a9a4495f03626a",
           "674b76bdd5a9a4495f03626d",
           "674b76bdd5a9a4495f036271",
           "674b76bdd5a9a4495f036274",
           "674b76bdd5a9a4495f036278",
           "674b76bdd5a9a4495f03627b",
           "674b76bdd5a9a4495f03627e",
           "674b76bdd5a9a4495f036282",
           "674b76bdd5a9a4495f036286",
           "674b76bdd5a9a4495f036289",
           "674b76bdd5a9a4495f03628d",
           "674b76bdd5a9a4495f036291",
           "674b76bdd5a9a4495f036294",
           "674b76bed5a9a4495f036298",
           "674b76bed5a9a4495f03629c",
           "674b76bed5a9a4495f03629f",
           "674b76bed5a9a4495f0362a3",
           "674b76bed5a9a4495f0362a6",
           "674b76bed5a9a4495f0362a9",
           "674b76bed5a9a4495f0362ac",
           "674b76bed5a9a4495f0362af",
           "674b76bed5a9a4495f0362b2",
           "674b76bed5a9a4495f0362b5",
           "674b76bed5a9a4495f0362b8",
           "674b76bed5a9a4495f0362bb",
           "674b76bed5a9a4495f0362be",
           "674b76bed5a9a4495f0362c1",
           "674b76bed5a9a4495f0362c4",
           "674b76bed5a9a4495f0362c7",
           "674b76bed5a9a4495f0362ca",
           "674b76bed5a9a4495f0362cd",
           "674b76bed5a9a4495f0362d0",
           "674b76bed5a9a4495f0362d3",
           "674b76bed5a9a4495f0362d6",
           "674b76bed5a9a4495f0362d9",
           "674b76bed5a9a4495f0362dc",
           "674b76bed5a9a4495f0362df",
           "674b76bed5a9a4495f0362e2",
           "674b76bed5a9a4495f0362e5",
           "674b76bed5a9a4495f0362e8",
           "674b76bed5a9a4495f0362ec",
           "674b76bed5a9a4495f0362ef",
           "674b76bed5a9a4495f0362f2",
           "674b76bed5a9a4495f0362f5",
           "674b76bed5a9a4495f0362f8",
           "674b76bed5a9a4495f0362fb",
           "674b76bed5a9a4495f0362fe",
           "674b76bed5a9a4495f036301",
           "674b76bed5a9a4495f036304",
           "674b76bed5a9a4495f036307",
           "674b76bed5a9a4495f03630a",
           "674b76bed5a9a4495f03630f",
           "674b76bed5a9a4495f036313",
           "674b76bed5a9a4495f036316"
       ]
   }
   ```

---

#### 5.2 Registro de Usuário (`POST /register`)

##### Exemplo:

1. **Método**: `POST`
2. **URL**: `http://localhost:3001/register`
3. **Body (JSON)**:
   ```json
   {
       "username": "rodrigosumioshi",
       "password": "rodrigosumioshi"
   }
   ```

---

#### 6.3 Login de Usuário (`POST /login`)

##### Exemplo:

1. **Método**: `POST`
2. **URL**: `http://localhost:3001/login`
3. **Body (JSON)**:
   ```json
   {
       "username": "rodrigosumioshi",
       "password": "rodrigosumioshi"
   }
   ```
---

## Testando a API

Use ferramentas como **Postman** ou **Insomnia** para testar as rotas. Certifique-se de adicionar o token JWT no cabeçalho das requisições.

Exemplo de cabeçalho:
```json
Authorization: Bearer <SEU_TOKEN_JWT>
```

---
