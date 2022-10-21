import React, {MutableRefObject, useEffect} from 'react';
import {PinSettings, TriggerHook} from "scrollmagic";
import Scroll from 'react-scroll';

type SceneProps = {
    id: string,
    children: JSX.Element[] | JSX.Element | null,
    controller?: ScrollMagic.Controller | null,
    duration: number,
    offset?: number,
    pushFollowers?: boolean,
    spacerClass?: string,
    triggerHook?: TriggerHook,
    triggerElement?: string,
    pin?: boolean,
    sectionRef?: MutableRefObject<any>,
    scrollSettings?: ScrollSettings
}

export type ScrollSettings = {
    enable?: boolean;
    offset?: number;
}

const defaultScrollSettings: ScrollSettings = {
    enable: true,
    offset: 0
}

const ScrollElement = Scroll.Element;

const Scene = (
    {
        id,
        children,
        controller,
        duration,
        offset = 0,
        pushFollowers = true,
        spacerClass,
        triggerHook = 0,
        triggerElement,
        pin = true,
        sectionRef,
        scrollSettings = defaultScrollSettings
    }: SceneProps
) => {
    const [scene, setScene] = React.useState<ScrollMagic.Scene | null>(null);

    useEffect(() => {
        (async () => {
            const ScrollMagic = (await import('scrollmagic')).default;
            if (controller && sectionRef?.current && !scene && pin) {
                const newScene = new ScrollMagic.Scene({
                    triggerElement: triggerElement || sectionRef.current,
                    duration,
                    offset,
                    triggerHook
                })
                    .setPin(sectionRef.current, { pushFollowers, spacerClass } as PinSettings)
                    .addTo(controller);
                setScene(newScene);
            }
        })()

        return () => {
            scene?.destroy();
        }
    }, [controller, sectionRef, duration, offset]);

    useEffect(() => {
        if (scene) {
            scene.enabled(pin);
        }
    }, [pin]);

    return (
        <ScrollElement ref={sectionRef} name={id} id={id}>
            {children}
        </ScrollElement>
    );
};

export default Scene;
