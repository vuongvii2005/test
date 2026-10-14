import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getUsers() {
    return [
      { name: 'Khiem Doe', id: '1', status: 'Active' },
      { name: 'Hung Smith', id: '2', status: 'Pending' },
      { name: 'Alex Nguyen', id: '3', status: 'Inactive' },
      { name: 'Alex Vu', id: '4', status: 'Active' },
    ];
  }
}
