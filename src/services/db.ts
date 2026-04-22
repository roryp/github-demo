import type { User } from './UserService.js';

const seed: User[] = [
  { id: '1', email: 'ada@example.com', name: 'Ada Lovelace', passwordHash: 'hashed:password' },
  { id: '2', email: 'grace@example.com', name: 'Grace Hopper', passwordHash: 'hashed:password' },
  { id: '3', email: 'alan@example.com', name: 'Alan Turing', passwordHash: 'hashed:password' },
];

export class InMemoryUserDb {
  private users: User[] = [...seed];

  async list(): Promise<User[]> {
    return [...this.users];
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((u) => u.id === id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email === email) ?? null;
  }

  async create(input: Omit<User, 'id'>): Promise<User> {
    const user: User = { id: String(this.users.length + 1), ...input };
    this.users.push(user);
    return user;
  }
}
