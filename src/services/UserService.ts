export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
}

export interface UserDb {
  list(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(input: Omit<User, 'id'>): Promise<User>;
}

export interface EmailService {
  send(to: string, subject: string, body: string): Promise<void>;
}

export class UserService {
  constructor(
    private db: UserDb,
    private email: EmailService,
  ) {}

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
