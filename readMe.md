Aqui está o **README.md** atualizado, agora mais intuitivo, completo e personalizado:

---

# MTG Deck API - Gerencie Seus Decks de Commander

### Documentação Completa

## Sumário

1. [Visão Geral](#visão-geral)
2. [Configurações e Dependências](#configurações-e-dependências)
3. [Rotas da API](#rotas-da-api)
   - [Autenticação](#autenticação)
   - [Cards](#cards)
   - [Decks](#decks)
4. [Notificações em Tempo Real](#notificações-em-tempo-real)
5. [Gerenciamento de Tarefas com RabbitMQ](#gerenciamento-de-tarefas-com-rabbitmq)
6. [Clusters e Melhorias de Desempenho](#clusters-e-melhorias-de-desempenho)
7. [Como Rodar a Aplicação](#como-rodar-a-aplicação)
8. [Testando com Insomnia](#testando-com-insomnia)

---

## Visão Geral

Esta API foi criada para gerenciar decks e cards de Magic: The Gathering, com suporte ao formato **Commander**. Ela inclui funcionalidades como:

- Criação, listagem e importação de decks.
- Validação de decks para garantir conformidade com as regras do Commander.
- Integração com **WebSocket** para notificações em tempo real.
- Gerenciamento de filas com **RabbitMQ** para tarefas assíncronas.
- Cache com **Redis** e suporte a clusters para alto desempenho.

---

## Configurações e Dependências

### Pré-requisitos

1. **Node.js**: v14+  
2. **MongoDB**: Para armazenamento de dados.  
3. **Redis**: Para cache de dados.  
4. **RabbitMQ**: Para gerenciamento de mensagens e tarefas assíncronas.  

### Configuração de Ambiente

Certifique-se de que os seguintes serviços estão rodando antes de iniciar a aplicação:

1. MongoDB:
   ```bash
   mongod
   ```
2. Redis:
   ```bash
   redis-server
   ```
3. RabbitMQ:
   ```bash
   docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
   ```

---

## Rotas da API

### Autenticação

- **`POST /register`**  
  Cria um novo usuário.  
  **Body (JSON)**:
  ```json
  {
      "username": "exemplo",
      "password": "senha123"
  }
  ```

- **`POST /login`**  
  Gera um token JWT para autenticação.  
  **Body (JSON)**:
  ```json
  {
      "username": "exemplo",
      "password": "senha123"
  }
  ```

---

### Cards

- **`GET /cards`**  
  Retorna todos os cards cadastrados.

- **`POST /cards-create`**  
  Cria um novo card (necessário autenticação com token JWT).  
  **Body (JSON)**:
  ```json
  {
      "name": "Card Name",
      "type": "Card Type"
  }
  ```

- **`GET /inserir-cards`**  
  Insere cards diretamente da API oficial de Magic: The Gathering (necessário autenticação).

---

### Decks

- **`POST /decks`**  
  Cria um novo deck (necessário autenticação).  
  **Body (JSON)**:
  ```json
  {
      "commanderId": "id_do_commander",
      "cardIds": ["id_card_1", "id_card_2", "..."]
  }
  ```

- **`GET /my-decks`**  
  Retorna todos os decks do usuário logado (utiliza cache para melhorar o desempenho).

- **`POST /decks/import`**  
  Importa decks via JSON e valida as regras do formato Commander.  
  **Body (JSON)**:
  ```json
  {
      "commanderId": "id_do_commander",
      "cardIds": ["id_card_1", "id_card_2", "..."]
  }
  ```

- **`PUT /decks/:id`**  
  Atualiza um deck existente.  
  **Body (JSON)**:
  ```json
  {
      "commanderId": "novo_commander_id",
      "cardIds": ["novo_card_id_1", "novo_card_id_2", "..."]
  }
  ```

- **`GET /decks/all`**  
  Retorna todos os decks (apenas para administradores).

---

## Notificações em Tempo Real

A API integra o **Socket.IO** para enviar notificações em tempo real aos usuários, como o status de importação de decks.

### Como Testar

1. Abra o arquivo `test-socket.html` no navegador.
2. Insira o **User ID** fornecido após o login.
3. Clique em "Connect".
4. Aguarde notificações em tempo real quando eventos forem disparados no backend.

---

## Gerenciamento de Tarefas com RabbitMQ

Mensagens são enviadas para filas para processamento assíncrono:

- **`deck_import_queue`**: Importação de decks.  
- **`deck_updates_queue`**: Atualizações de status.  

Configuração no RabbitMQ para diferentes prioridades foi implementada.

---

## Clusters e Melhorias de Desempenho

- **Clusters**: O aplicativo usa todos os núcleos de CPU disponíveis para aumentar a capacidade de requisições.
- **Cache**: Melhorias na listagem de decks com Redis para reduzir o tempo de resposta.

---

## Como Rodar a Aplicação

1. Clone o repositório:
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd <PASTA_DO_REPOSITORIO>
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie a aplicação:
   ```bash
   npm start
   ```

---

## Testando com Insomnia

### Importar Deck (`POST /decks/import`)

**Headers**:
```json
{
    "Authorization": "Bearer <SEU_TOKEN>",
    "Content-Type": "application/json"
}
```

**Body**:
```json
{
    "commanderId": "id_do_commander",
    "cardIds": ["id_card_1", "id_card_2", "..."]
}
```

### Registro de Usuário (`POST /register`)

**Body**:
```json
{
    "username": "exemplo",
    "password": "senha123"
}
```

---
