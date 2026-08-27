import { useEffect, useRef, useState } from "react";


export const useCountUp = (target: number, duration = 650): number => {
    const [display, setDisplay] = useState(0);
    const fromRef = useRef(0);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        const from = fromRef.current;
        const to = target;
        if (from === to) {
            setDisplay(to);
            return;
        }

        const start = Date.now();
        const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(1, elapsed / duration);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = from + (to - from) * eased;
            setDisplay(value);

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(tick);
            } else {
                fromRef.current = to;
            }
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        };
    }, [target]);

    return display;
};
