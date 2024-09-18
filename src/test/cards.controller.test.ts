import request from 'supertest';
import app from '../app';
import Card from '../schema/cards.schema';

jest.mock('../schema/cards.schema.ts');

describe('CRUD e Autenticação de Cards', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Deve criar um card autenticado', async () => {
    const mockCard = { name: 'Mock Card', mana_cost: 5 };
    (Card.create as jest.Mock).mockResolvedValue(mockCard);

    const response = await request(app)
      .post('/cards-auth-create')
      .set('Authorization', 'Bearer fake-jwt-token')
      .send(mockCard);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(mockCard);
  });

  it('Deve falhar ao criar um card sem autenticação', async () => {
    const mockCard = { name: 'Mock Card', mana_cost: 5 };

    const response = await request(app)
      .post('/cards-auth-create')
      .send(mockCard);

    expect(response.status).toBe(401);
  });

  it('Deve falhar ao criar um card sem nome', async () => {
    const mockCard = { mana_cost: 5 };  

    const response = await request(app)
      .post('/cards-auth-create')
      .set('Authorization', 'Bearer fake-jwt-token')
      .send(mockCard);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Nome do card é obrigatório');
  });

  it('Deve buscar todos os cards', async () => {
    const mockCards = [
      { name: 'Card 1', mana_cost: 3 },
      { name: 'Card 2', mana_cost: 4 },
    ];
    (Card.find as jest.Mock).mockResolvedValue(mockCards);

    const response = await request(app).get('/cards');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockCards);
  });

  it('Deve retornar um array vazio se não houver cards', async () => {
    (Card.find as jest.Mock).mockResolvedValue([]);

    const response = await request(app).get('/cards');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('Deve falhar ao buscar card com ID inválido', async () => {
    (Card.findById as jest.Mock).mockResolvedValue(null);  

    const response = await request(app).get('/cards/invalid-id');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Card não encontrado');
  });

  it('Deve atualizar um card autenticado', async () => {
    const mockCard = { name: 'Updated Card', mana_cost: 7 };
    (Card.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockCard);

    const response = await request(app)
      .put('/cards-auth-put/1')
      .set('Authorization', 'Bearer fake-jwt-token')
      .send(mockCard);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockCard);
  });

  it('Deve falhar ao atualizar um card com ID inválido', async () => {
    const mockCard = { name: 'Updated Card', mana_cost: 7 };
    (Card.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);  

    const response = await request(app)
      .put('/cards-auth-put/invalid-id')
      .set('Authorization', 'Bearer fake-jwt-token')
      .send(mockCard);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Card não encontrado');
  });

  it('Deve falhar ao atualizar um card sem autenticação', async () => {
    const mockCard = { name: 'Updated Card', mana_cost: 7 };

    const response = await request(app)
      .put('/cards-auth-put/1')
      .send(mockCard);

    expect(response.status).toBe(401);
  });

  it('Deve falhar ao atualizar um card sem nome', async () => {
    const mockCard = { mana_cost: 7 };  

    const response = await request(app)
      .put('/cards-auth-put/1')
      .set('Authorization', 'Bearer fake-jwt-token')
      .send(mockCard);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Nome do card é obrigatório');
  });

  it('Deve deletar um card autenticado', async () => {
    (Card.findByIdAndDelete as jest.Mock).mockResolvedValue(true);

    const response = await request(app)
      .delete('/cards-auth-delete/1')
      .set('Authorization', 'Bearer fake-jwt-token');

    expect(response.status).toBe(204);
  });

  it('Deve falhar ao deletar um card com ID inválido', async () => {
    (Card.findByIdAndDelete as jest.Mock).mockResolvedValue(null);  

    const response = await request(app)
      .delete('/cards-auth-delete/invalid-id')
      .set('Authorization', 'Bearer fake-jwt-token');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Card não encontrado');
  });

  it('Deve falhar ao deletar um card sem autenticação', async () => {
    const response = await request(app)
      .delete('/cards-auth-delete/1');

    expect(response.status).toBe(401);
  });
});
