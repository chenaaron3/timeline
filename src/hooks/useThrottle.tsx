/* eslint-disable */

import { useCallback, useRef } from 'react';

export const useThrottle = (
    // eslint
    callback: (...args: any[]) => void,
    delay: number,
    deps: any[]
) => {
    const lastRan = useRef(Date.now());
    const lastRequest = useRef("");

    return useCallback(
        (...args: any[]) => {
            // Dedupe duplicate requests
            const stringArgs = args.map(arg => String(arg)).join(", ")
            if (stringArgs == lastRequest.current) {
                return
            }
            lastRequest.current = stringArgs

            const handler = () => {
                console.log(lastRan)
                // Ignore the request if it has not met the delay
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
