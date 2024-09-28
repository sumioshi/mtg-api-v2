# Documentação API Parte 02

## Todas as rotas estão no arquivo 'routes.ts' na raiz do projeto 

1 - Permita que mais de um baralho seja criado em sua aplicação: 
  No arquivo 'routes' contém a rota '/decks' que é responsável por essa parte.


2 - Crie uma rota para listar todos os baralhos (somente um usuário com permissão admin pode usar essa rota): 
  A rota é '/decks/all', o usuário deve ter o 'role : admin' para poder acessa-lá.


3 - Crie uma rota para listar somente os baralhos do jogador que está logado:
  Rota '/my-decks'.


4 - Adicione cacheamento na rota de listar para listar todos os baralhos do jogador logado: 
  Foi criado na rota 'my-decks'.


5 - Crie uma rota onde seja possível "importar" um baralho via json, e valide se esse baralho segue as regras do commander:
  Rota '/decks/import'.


6 - Realize os testes de performance e indique o comparativo de quantas vezes mais requisições e tempo de resposta você conseguiu atender utilizando a listagem de baralhos com cache e sem cache e 
7 - Utilize Clusters na sua aplicação e faça novos testes de performance e demonstre os números obtidos:
  Ambos testes foram feitos, os resultados estão no arquivo 'Relatório_Desempenho.pdf'.


8 - Utilizar Node.js streams para consumir a API de magic e também para consumir sua própria API: 
  As Rotas são: '/cards/stream-magic', '/cards/stream'.

## Passos para rodar o projeto

### 1. Clonar o repositório
Faça o clone do repositório em sua máquina local utilizando o seguinte comando:

bash
git clone <URL_DO_REPOSITORIO>


### 2. Instalar as dependências
Após clonar o repositório, navegue até a pasta raiz do projeto e instale as dependências utilizando o gerenciador de pacotes *npm*:

bash
npm install


### 3. Configurar o Banco de Dados MongoDB
Certifique-se de que o MongoDB está instalado e rodando em sua máquina. O projeto utiliza um banco de dados MongoDB para armazenar os dados.

- Se você não tiver o MongoDB instalado, siga as instruções em [https://www.mongodb.com/docs/manual/installation/](https://www.mongodb.com/docs/manual/installation/).
- Por padrão, o MongoDB local será utilizado na conexão mongodb://127.0.0.1:27017/cardsCommander. Você pode ajustar essa URL no arquivo app.ts na parte da configuração do banco de dados.

### 4. Configurar o Redis (para Cache)
A aplicação utiliza o Redis para cachear as requisições. Certifique-se de que o Redis está rodando em sua máquina.

- Se não tiver o Redis instalado, siga as instruções em [https://redis.io/docs/getting-started/](https://redis.io/docs/getting-started/).
- Verifique se o Redis está ativo com o seguinte comando:

bash
redis-server


### 5. Executar o projeto com clusters
O projeto utiliza clusters para otimizar o desempenho em máquinas com múltiplos núcleos de CPU.

- Para rodar o projeto com clusters, basta iniciar o servidor com o comando padrão *npm start*:

bash
npm start


Isso irá iniciar a aplicação distribuindo as requisições em múltiplos processos.

### 6. Testar o projeto
A aplicação está pronta para ser testada. Aqui estão algumas das rotas principais para testar as funcionalidades:

- *Criar um novo baralho*:  
  POST /decks

- *Listar todos os baralhos (somente admin)*:  
  GET /decks/all

- *Listar os baralhos do usuário logado*:  
  GET /my-decks

- *Importar um baralho via JSON*:  
  POST /decks/import

- *Consumir a API de Magic usando streams*:  
  GET /cards/stream-magic

### 7. Rodar os testes de performance
Os testes de performance já foram realizados e os resultados estão disponíveis no arquivo Relatório_Desempenho.pdf. Se quiser rodar novos testes, você pode utilizar a ferramenta *Apache Benchmark (ab)* ou outras ferramentas de benchmarking.

