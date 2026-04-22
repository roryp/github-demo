export class EmailSender {
  async send(to: string, subject: string, body: string): Promise<void> {
    console.log(`[email] to=${to} subject=${subject} body=${body.slice(0, 40)}...`);
  }
}
