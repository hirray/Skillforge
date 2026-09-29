export interface Job {
  id: string;
  name: string;
  payload: any;
}

export interface QueueProvider {
  enqueue(name: string, payload: any): Promise<void>;
  process(name: string, handler: (job: Job) => Promise<void>): void;
}

export class MemoryQueueProvider implements QueueProvider {
  private handlers = new Map<string, (job: Job) => Promise<void>>();

  async enqueue(name: string, payload: any): Promise<void> {
    const handler = this.handlers.get(name);
    if (handler) {
      setTimeout(async () => {
        try {
          await handler({ id: Math.random().toString(), name, payload });
        } catch (err) {
          console.error(\`Job \${name} failed\`, err);
        }
      }, 0);
    }
  }

  process(name: string, handler: (job: Job) => Promise<void>): void {
    this.handlers.set(name, handler);
  }
}

export const queueProvider = new MemoryQueueProvider();
