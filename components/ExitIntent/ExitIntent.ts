import throttle from 'lodash/throttle';

export default function ExitIntent(options = {}) {
  const defaultOptions = {
    threshold: 20,
    maxDisplays: 1,
    eventThrottle: 200,
    onExitIntent: () => {},
  };

  return (function exitIntent() {
    const config = { ...defaultOptions, ...options };
    const eventListeners = new Map();
    let displays = 0;

    const addEvent = (eventName: string, callback: typeof throttle) => {
      document.addEventListener(eventName, callback as EventListener, false);
      eventListeners.set(`document:${eventName}`, { eventName, callback });
    };

    const removeEvent = (key: string) => {
      const { eventName, callback } = eventListeners.get(key);
      document.removeEventListener(eventName, callback);
      eventListeners.delete(key);
    };

    const shouldDisplay = (position: number) => {
      if (position <= config.threshold && displays < config.maxDisplays) {
        displays += 1;
        return true;
      }
      return false;
    };

    const removeEvents = () => {
      eventListeners.forEach((value, key) => removeEvent(key));
    };

    const mouseDidMove = (event: MouseEvent) => {
      if (shouldDisplay(event.clientY)) {
        config.onExitIntent();
        if (displays >= config.maxDisplays) {
          removeEvents();
        }
      }
    };

    addEvent(
      'mousemove',
      throttle(mouseDidMove as (...args: any) => any, config.eventThrottle)
    );

    return removeEvents;
  })();
}
