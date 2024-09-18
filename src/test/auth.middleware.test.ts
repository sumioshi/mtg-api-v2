import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import User from '../schema/user.schema';

jest.mock('../schema/user.schema');

describe('Autenticação JWT', () => {
  const token = jwt.sign({ id: '123' }, 'your_jwt_secret');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve permitir acesso com token válido', async () => {
    const mockUser = { _id: '123', username: 'testuser' };
    (User.findById as jest.Mock).mockResolvedValue(mockUser);

    const response = await request(app)
      .post('/cards-auth-create')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Magic Card', type: 'Spell' });

    console.log('Resposta com token válido:', response.body);
    console.log('Status com token válido:', response.status);

    expect(response.statusCode).toBe(201);
  });

  it('deve retornar erro 401 se o token for inválido', async () => {
    const invalidToken = 'invalidToken';

    const response = await request(app)
      .post('/cards-auth-create')
      .set('Authorization', `Bearer ${invalidToken}`)
      .send({ name: 'Magic Card', type: 'Spell' });

    console.log('Resposta com token inválido:', response.body);
    console.log('Status com token inválido:', response.status);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Invalid Token');
  });
});
