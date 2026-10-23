export interface EmailProvider {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
}

export class ConsoleEmailProvider implements EmailProvider {
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    console.log(`[EMAIL] To: ${to} | Subject: ${subject}\n${body}`);
  }
}

export const emailProvider = new ConsoleEmailProvider();
