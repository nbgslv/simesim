import React, {useEffect} from 'react';

const Controller = ({ children }: { children: JSX.Element[] | JSX.Element }) => {
    const [controller, setController] = React.useState<ScrollMagic.Controller | null>(null);


    useEffect(() => {
        (async () => {
            const ScrollMagic = (await import('scrollmagic')).default;
            if (typeof window !== undefined) {
                setController(new ScrollMagic.Controller());
            }
        })()
    }, [])

    if (typeof window === undefined) return null

    return (
        <>
            {
                React.Children.map(children, (child) => {
                    return React.cloneElement(child, { controller });
                })
            }
        </>
    );
};

export default Controller;
