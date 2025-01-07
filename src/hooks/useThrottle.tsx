/* eslint-disable */

import { useCallback, useRef } from 'react';

export const useThrottle = (
    // eslint
    callback: (...args: any[]) => void,
    delay: number,
    deps: any[]
) => {
    const lastRan = useRef(Date.now());

    return useCallback(
        (...args: any[]) => {
            const handler = () => {
                if (Date.now() - lastRan.current >= delay) {
                    callback(...args);
                    lastRan.current = Date.now();
                }
            };

            const timeout = setTimeout(() => {
                handler();
            }, delay - (Date.now() - lastRan.current));

            return () => {
                clearTimeout(timeout);
            };
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [delay, ...deps]
    );
};
