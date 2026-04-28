import { describe, it, expect } from 'vitest';
import { UserService } from '../src/services/UserService.js';
import type { UserDb, EmailService, User } from '../src/services/UserService.js';

class FakeUserDb implements UserDb {
  private users: User[] = [
    { id: '1', email: 'ada@example.com', name: 'Ada Lovelace', passwordHash: 'hashed:password' },
  ];

  async list() {
    return [...this.users];
  }
  async findById(id: string) {
    return this.users.find((u) => u.id === id) ?? null;
  }
  async findByEmail(email: string) {
    return this.users.find((u) => u.email === email) ?? null;
  }
  async create(input: Omit<User, 'id'>) {
    const user: User = { id: String(this.users.length + 1), ...input };
    this.users.push(user);
    return user;
  }
}

class FakeEmailService implements EmailService {
  sent: { to: string; subject: string; body: string }[] = [];

  async send(to: string, subject: string, body: string) {
    this.sent.push({ to, subject, body });
  }
}

describe('UserService', () => {
  function setup() {
    const db = new FakeUserDb();
    const email = new FakeEmailService();
    const service = new UserService(db, email);
    return { db, email, service };
  }

  describe('authenticate', () => {
    it('returns user for valid credentials', async () => {
      const { service } = setup();
      const user = await service.authenticate('ada@example.com', 'password');
      expect(user).not.toBeNull();
      expect(user!.email).toBe('ada@example.com');
    });

    it('returns null for wrong password', async () => {
      const { service } = setup();
      const user = await service.authenticate('ada@example.com', 'wrong');
      expect(user).toBeNull();
    });

    it('returns null for unknown email', async () => {
      const { service } = setup();
      const user = await service.authenticate('unknown@example.com', 'password');
      expect(user).toBeNull();
    });
  });

  describe('list', () => {
    it('returns all users', async () => {
      const { service } = setup();
      const users = await service.list();
      expect(users).toHaveLength(1);
      expect(users[0].email).toBe('ada@example.com');
    });
  });

  describe('findById', () => {
    it('returns user by id', async () => {
      const { service } = setup();
      const user = await service.findById('1');
      expect(user).not.toBeNull();
      expect(user!.name).toBe('Ada Lovelace');
    });

    it('returns null for missing id', async () => {
      const { service } = setup();
      const user = await service.findById('999');
      expect(user).toBeNull();
    });
  });

  describe('invite', () => {
    it('creates user and sends welcome email', async () => {
      const { service, email } = setup();
      const user = await service.invite('new@example.com', 'New User');

      expect(user.email).toBe('new@example.com');
      expect(user.name).toBe('New User');
      expect(email.sent).toHaveLength(1);
      expect(email.sent[0].to).toBe('new@example.com');
      expect(email.sent[0].subject).toBe('Welcome');
    });
  });
});
