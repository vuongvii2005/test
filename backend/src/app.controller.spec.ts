import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('users', () => {
    it('should return sample users', () => {
      expect(appController.getUsers()).toEqual([
        { name: 'John Doe', id: '1', status: 'Active' },
        { name: 'Jane Smith', id: '2', status: 'Pending' },
        { name: 'Alex Nguyen', id: '3', status: 'Inactive' },
      ]);
    });
  });
});
