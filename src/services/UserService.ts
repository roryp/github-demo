import { InMemoryUserDb, type UserDb } from './db.js';
import { EmailSender, type Emailer } from './emailSender.js';

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
}

/**
 * UserService receives its collaborators via constructor injection so
 * call sites (and tests) can swap in fakes without monkey-patching.
 */
export class UserService {
  constructor(private readonly db: UserDb, private readonly email: Emailer) {}

  async authenticate(email: string, password: string): Promise<User | null> {
    const user = await this.db.findByEmail(email);
    if (!user) return null;
    if (user.passwordHash !== `hashed:${password}`) return null;
    return user;
  }

  async list(): Promise<User[]> {
    return this.db.list();
  }

  async findById(id: string): Promise<User | null> {
    return this.db.findById(id);
  }

  async invite(email: string, name: string): Promise<User> {
    const user = await this.db.create({ email, name, passwordHash: 'hashed:changeme' });
    await this.email.send(email, 'Welcome', `Hi ${name}, your account is ready.`);
    return user;
  }
}

let defaultInstance: UserService | null = null;

/**
 * Shared default instance for route modules. Tests should construct
 * their own UserService with fake collaborators rather than using this.
 */
export function getDefaultUserService(): UserService {
  if (!defaultInstance) {
    defaultInstance = new UserService(new InMemoryUserDb(), new EmailSender());
  }
  return defaultInstance;
}
