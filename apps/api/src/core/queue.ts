export interface QueueJob<T = any> {
  id: string;
  name: string;
  data: T;
}

export interface JobQueue {
  add<T>(name: string, data: T): Promise<QueueJob<T>>;
  process<T>(name: string, handler: (job: QueueJob<T>) => Promise<void>): void;
}

export class InMemoryJobQueue implements JobQueue {
  private handlers: Map<string, (job: QueueJob<any>) => Promise<void>> = new Map();

  async add<T>(name: string, data: T): Promise<QueueJob<T>> {
    const job: QueueJob<T> = {
      id: Math.random().toString(36).substring(7),
      name,
      data,
    };
    
    // Process asynchronously in memory
    setTimeout(async () => {
      const handler = this.handlers.get(name);
      if (handler) {
        try {
          await handler(job);
        } catch (err) {
          console.error(`Error processing job ${name}:`, err);
        }
      }
    }, 0);

    return job;
  }

  process<T>(name: string, handler: (job: QueueJob<T>) => Promise<void>): void {
    this.handlers.set(name, handler);
  }
}

export const jobQueue = new InMemoryJobQueue();
