import React, {MutableRefObject, useCallback, useEffect, useRef, useState} from 'react';
import Scroll from 'react-scroll';
import {ScrollSettings} from "../ScrollMagic/Scene";

enum KeyCodes {
    ARROW_UP = 'ArrowUp',
    ARROW_DOWN = 'ArrowDown'
}

const ScrollController = ({ children }: { children: JSX.Element[] | JSX.Element }) => {
    const [currentSection, setCurrentSection] = useState<number>(0);
    const sectionRefs = useRef<MutableRefObject<any>[]>([]);
    const sectionSettings = useRef<ScrollSettings[]>([])

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.code === KeyCodes.ARROW_UP && currentSection >= 0) {
            goToPreviousSection();
        } else if (e.code === KeyCodes.ARROW_DOWN && currentSection < sectionRefs.current.length) {
            goToNextSection();
        }
    }, [])

    const handleMouseWheel = (e: WheelEvent) => {
        console.log('mouse scroll event', sectionRefs)
        console.log('section settings', sectionSettings)
        if (e.deltaY < 0 && currentSection >= 0) {
            goToPreviousSection();
        } else if (e.deltaY > 0 && currentSection < sectionRefs.current.length) {
            goToNextSection();
        }
    }

    const goToNextSection = () => {
        console.log('next', currentSection < sectionRefs.current.length)
        if (currentSection < sectionRefs.current.length) {
            setCurrentSection(currentSection + 1);
        }
    }

    const goToPreviousSection = () => {
        if (currentSection > 0) {
            setCurrentSection(currentSection - 1);
        }
    }

    const goToSection = (section: number) => {
        if (section >= 0 && section < sectionRefs.current.length) {
            setCurrentSection(section);
        }
    }

    useEffect(() => {
        if (typeof window !== undefined) {
            window.addEventListener('wheel', handleMouseWheel);
            window.addEventListener('keydown', handleKeyDown);

            return () => {
                window.removeEventListener('wheel', handleMouseWheel);
                window.removeEventListener('keydown', handleKeyDown);
            }
        }
    }, [])

    useEffect(() => {
        console.log('currentSection', currentSection);
        if (sectionRefs.current.length > 0 && sectionRefs.current[currentSection].current) {
            console.log('id', sectionRefs.current[currentSection].current.id);
            // @ts-ignore
            Scroll.scroller.scrollTo(sectionRefs.current[currentSection].current.childBindings.domNode.id)
        }
    }, [currentSection])

    return (
        <>
            {React.Children.map(children, (child, index) => {
                const ref = useRef<HTMLElement>(null);
                sectionRefs.current[index] = ref;
                console.log(child)
                sectionSettings.current[index] = child.props.scrollSettings || { enable: true, offset: 0 };
                return React.cloneElement(child, { sectionRef: ref })
            })}
        </>
    );
};

export default ScrollController;
