import { describe, it, expect, vi } from 'vitest';
import { UserService, type User } from '../src/services/UserService.js';
import type { UserDb } from '../src/services/db.js';
import type { Emailer } from '../src/services/emailSender.js';

function buildFakeDb(initial: User[] = []): UserDb & { created: User[] } {
  const users = [...initial];
  const created: User[] = [];
  return {
    created,
    async list() { return [...users]; },
    async findById(id) { return users.find((u) => u.id === id) ?? null; },
    async findByEmail(email) { return users.find((u) => u.email === email) ?? null; },
    async create(input) {
      const user: User = { id: String(users.length + 1), ...input };
      users.push(user);
      created.push(user);
      return user;
    },
  };
}

describe('UserService (DI)', () => {
  it('authenticates against the injected db', async () => {
    const db = buildFakeDb([
      { id: '1', email: 'a@x.com', name: 'A', passwordHash: 'hashed:pw' },
    ]);
    const email: Emailer = { send: vi.fn() };
    const svc = new UserService(db, email);

    expect(await svc.authenticate('a@x.com', 'pw')).not.toBeNull();
    expect(await svc.authenticate('a@x.com', 'wrong')).toBeNull();
    expect(email.send).not.toHaveBeenCalled();
  });

  it('calls the injected emailer on invite', async () => {
    const db = buildFakeDb();
    const email: Emailer = { send: vi.fn().mockResolvedValue(undefined) };
    const svc = new UserService(db, email);

    const user = await svc.invite('new@x.com', 'New User');

    expect(user.email).toBe('new@x.com');
    expect(db.created).toHaveLength(1);
    expect(email.send).toHaveBeenCalledWith('new@x.com', 'Welcome', expect.any(String));
  });
});
