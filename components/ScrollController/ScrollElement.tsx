import React, {useEffect} from 'react';
import Scroll from "react-scroll";
import {ScrollSettings} from "../ScrollMagic/Scene";

const ReactScrollElement = Scroll.Element;

type ScrollElementProps = {
    children: JSX.Element[] | JSX.Element
    scrollSettings?: ScrollSettings
    name: string
    id: string
    className?: string
}

const ScrollElement = ({ children, name, id, className }: ScrollElementProps) => {
    return (
        <ReactScrollElement name={name} id={id} className={className}>
            {children}
        </ReactScrollElement>
    );
};

export default ScrollElement;
