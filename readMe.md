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
