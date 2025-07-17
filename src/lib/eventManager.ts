type Listener = { eventType: string; handler: Function };

const eventMap = new WeakMap<Element, Listener[]>();
const eventTypes = new Set<string>();

export function setupEventListeners(root: Element) {
  eventTypes.forEach((eventType) => {
    root.addEventListener(eventType, handleDelegatedEvent);
  });
}

export function addEvent(element: Element, eventType: string, handler: Function) {
  if (!eventTypes.has(eventType)) {
    eventTypes.add(eventType);
  }

  const listeners = eventMap.get(element) || [];

  listeners.push({ eventType, handler });
  eventMap.set(element, listeners);
}

export function removeEvent(element: Element, eventType: string, handler: Function) {
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
  let target = event.target;

  while (target) {
    if (!(target instanceof Element)) break;

    (eventMap.get(target) || [])
      .filter((listener) => listener.eventType === event.type)
      .forEach((listener) => listener.handler(event));

    target = target.parentElement;
  }
}
