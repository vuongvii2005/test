import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .expect([
        { name: 'Khiem Doe', id: '1', status: 'Active' },
        { name: 'Hung Smith', id: '2', status: 'Pending' },
        { name: 'Alex Nguyen', id: '3', status: 'Inactive' },
        { name: 'Alex Vu', id: '4', status: 'Active' },
        { name: 'Alex A', id: '5', status: 'Pending' },
        { name: 'Alex B', id: '6', status: 'Active' },
        { name: 'Alex C', id: '7', status: 'Inactive' },
        { name: 'Alex D', id: '8', status: 'Pending' },
        { name: 'Alex E', id: '9', status: 'Active' },
        { name: 'Alex F', id: '10', status: 'Inactive' },
        { name: 'Alex G', id: '11', status: 'Active' },
        { name: 'Alex H', id: '12', status: 'Pending' },
        { name: 'Alex I', id: '13', status: 'Inactive' },
        { name: 'Alex J', id: '14', status: 'Active' },
      ]);
  });
});
