type Listener = { eventType: string; handler: EventListener };

const eventMap = new WeakMap<Element, Listener[]>();
const eventTypes = new Set<string>();

export function setupEventListeners(root: Element) {
  eventTypes.forEach((eventType) => {
    root.addEventListener(eventType, handleDelegatedEvent);
  });
}

export function addEvent(element: Element, eventType: string, handler: EventListener) {
  if (!eventTypes.has(eventType)) {
    eventTypes.add(eventType);
  }

  const listeners = eventMap.get(element) || [];

  listeners.push({ eventType, handler });
  eventMap.set(element, listeners);
}

export function removeEvent(element: Element, eventType: string, handler: EventListener) {
  const listeners = eventMap.get(element);

  if (!listeners) return;

  const filteredListeners = listeners.filter(
    (listener) => listener.eventType !== eventType || listener.handler !== handler,
  );

  if (filteredListeners.length === 0) {
    eventMap.delete(element);
  } else {
    eventMap.set(element, filteredListeners);
  }
}

function handleDelegatedEvent(event: Event) {
  (eventMap.get(event.target as Element) || [])
    .filter((listener) => listener.eventType === event.type)
    .forEach((listener) => listener.handler(event));
}
