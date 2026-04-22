import { InMemoryUserDb } from './db.js';
import { EmailSender } from './emailSender.js';

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
}

/**
 * UserService currently constructs its own collaborators internally.
 * This makes it hard to test and impossible to swap implementations —
 * see issue #5 for the planned refactor to constructor injection.
 */
export class UserService {
  private db = new InMemoryUserDb();
  private email = new EmailSender();

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
