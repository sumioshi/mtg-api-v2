Aqui está a documentação atualizada, incluindo as partes novas que foram implementadas:

---

# Documentação API Parte 02

## Todas as rotas estão no arquivo `routes.ts` na raiz do projeto 

1 - **Permita que mais de um baralho seja criado em sua aplicação:**  
   - A rota `POST /decks` é responsável por essa funcionalidade.  

2 - **Crie uma rota para listar todos os baralhos (somente um usuário com permissão admin pode usar essa rota):**  
   - A rota é `GET /decks/all`. O usuário deve ter a permissão `role: admin` para acessá-la.  

3 - **Crie uma rota para listar somente os baralhos do jogador que está logado:**  
   - A rota é `GET /my-decks`.  

4 - **Adicione cacheamento na rota para listar todos os baralhos do jogador logado:**  
   - A funcionalidade de cache foi implementada na rota `GET /my-decks`.  

5 - **Crie uma rota onde seja possível "importar" um baralho via JSON, e valide se esse baralho segue as regras do Commander:**  
   - A rota é `POST /decks/import`.  
   - Essa rota agora também utiliza **RabbitMQ** para gerenciar a importação de decks de forma assíncrona e notificar o cliente em tempo real via WebSocket sobre o status da importação.  

6 - **Realize os testes de performance e indique o comparativo de quantas vezes mais requisições e tempo de resposta você conseguiu atender utilizando a listagem de baralhos com cache e sem cache:**  
   - Os testes foram realizados, e os resultados estão documentados no arquivo `Relatório_Desempenho.pdf`.  

7 - **Utilize Clusters na sua aplicação e faça novos testes de performance e demonstre os números obtidos:**  
   - Clusters foram configurados, e os testes de desempenho utilizando múltiplos núcleos de CPU também estão no arquivo `Relatório_Desempenho.pdf`.  

8 - **Utilizar Node.js streams para consumir a API de Magic e também para consumir sua própria API:**  
   - As rotas são:  
     - `GET /cards/stream-magic`: Consome a API externa de Magic via stream.  
     - `GET /cards/stream`: Consome sua própria API de cards via stream.  

9 - **Implemente um sistema de notificações em tempo real:**  
   - Um sistema de **WebSocket** foi integrado utilizando **Socket.IO**.  
   - Usuários podem receber notificações em tempo real, por exemplo, ao importar um baralho.  
   - Teste o WebSocket conectando à URL `ws://localhost:3001/socket.io/?EIO=4&transport=websocket` com o evento:  
     ```json
     ["join", { "userId": "12345" }]
     ```
   - Notificações podem ser enviadas usando o método `notifyUser(userId, message)` no backend.  

10 - **Implemente filas de tarefas com diferentes prioridades:**  
    - Utilizamos **RabbitMQ** para gerenciar filas.  
    - Mensagens relacionadas à importação de baralhos são enviadas para a fila `deck_import_queue`.  
    - Mensagens com diferentes prioridades podem ser processadas com base no nível de permissão do usuário.  

---

## Passos para rodar o projeto

### 1. Clonar o repositório  
Faça o clone do repositório em sua máquina local utilizando o seguinte comando:  
```bash
git clone <URL_DO_REPOSITORIO>
```

### 2. Instalar as dependências  
Após clonar o repositório, navegue até a pasta raiz do projeto e instale as dependências:  
```bash
npm install
```

### 3. Configurar o Banco de Dados MongoDB  
Certifique-se de que o MongoDB está instalado e rodando. O projeto utiliza um banco de dados MongoDB para armazenar os dados.

- Por padrão, a URL do banco é `mongodb://127.0.0.1:27017/cardsCommander`.  

### 4. Configurar o Redis (para Cache)  
A aplicação utiliza o Redis para cachear requisições. Certifique-se de que o Redis está rodando:  
```bash
redis-server
```

### 5. Configurar RabbitMQ (para Mensageria)  
Certifique-se de que o RabbitMQ está rodando. Inicie o serviço com o Docker:  
```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```
Acesse o painel do RabbitMQ em: `http://localhost:15672` (usuário: `guest`, senha: `guest`).  

### 6. Executar o projeto com clusters  
Para rodar o projeto com clusters, basta iniciar o servidor com o comando padrão:  
```bash
npm start
```
