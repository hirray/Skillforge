import { EventEmitter } from 'events';
import { DomainEvent, EventPayloads } from '@skillforge/contract';

class EventBus extends EventEmitter {
  emitEvent<T extends DomainEvent>(event: T, payload: EventPayloads[T]) {
    this.emit(event, payload);
  }

  onEvent<T extends DomainEvent>(event: T, listener: (payload: EventPayloads[T]) => void) {
    this.on(event, listener);
  }
}

export const eventBus = new EventBus();
