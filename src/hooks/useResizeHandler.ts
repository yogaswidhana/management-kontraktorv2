import { useEffect } from 'react';

export const useResizeHandler = () => {
    useEffect(() => {
        // Mencegah error ResizeObserver dengan menambahkan handler khusus
        const debounce = (fn: Function, delay: number) => {
            let timeoutId: NodeJS.Timeout;
            return (...args: any[]) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => fn(...args), delay);
            };
        };

        const resizeHandler = debounce(() => {
            // Trigger resize event dengan delay dan mencegah error ResizeObserver
            requestAnimationFrame(() => {
                window.dispatchEvent(new Event('resize'));
            });
        }, 100);

        // Menambahkan error handler untuk ResizeObserver
        const errorHandler = (event: ErrorEvent) => {
            if (event.message === 'ResizeObserver loop completed with undelivered notifications.') {
                event.stopPropagation();
            }
        };

        window.addEventListener('error', errorHandler);
        window.addEventListener('resize', resizeHandler);

        return () => {
            window.removeEventListener('error', errorHandler);
            window.removeEventListener('resize', resizeHandler);
        };
    }, []);
};