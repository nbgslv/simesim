import React, { useEffect } from 'react';
import { PinSettings, TriggerHook } from 'scrollmagic';

type SceneProps = {
  children: JSX.Element[] | JSX.Element | null;
  controller?: ScrollMagic.Controller | null;
  duration: number;
  offset?: number;
  pushFollowers?: boolean;
  spacerClass?: string;
  triggerHook?: TriggerHook;
  triggerElement?: string;
  pin?: boolean;
};

const Scene = ({
  children,
  controller,
  duration,
  offset = 0,
  pushFollowers = true,
  spacerClass,
  triggerHook = 0,
  triggerElement,
  pin = true,
}: SceneProps) => {
  const [scene, setScene] = React.useState<ScrollMagic.Scene | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const ScrollMagic = (await import('scrollmagic')).default;
      if (controller && containerRef?.current && !scene) {
        const newScene = new ScrollMagic.Scene({
          triggerElement: triggerElement || containerRef.current,
          duration,
          offset,
          triggerHook,
        })
          .setPin(containerRef.current, {
            pushFollowers,
            spacerClass,
          } as PinSettings)
          .addTo(controller);
        setScene(newScene);
      }
    })();

    return () => {
      scene?.destroy();
    };
  }, [controller, containerRef, duration, offset]);

  useEffect(() => {
    if (scene && !pin) {
      scene.removePin();
    }
  }, [pin]);

  return <div ref={containerRef}>{children}</div>;
};

export default Scene;
