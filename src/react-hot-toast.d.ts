declare module 'react-hot-toast' {
    import { ReactNode } from 'react';

    export interface ToastOptions {
        duration?: number;
        position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
        icon?: ReactNode;
        style?: React.CSSProperties;
        className?: string;
        id?: string;
        theme?: 'light' | 'dark';
    }

    export function toast(message: string | ReactNode, options?: ToastOptions): string;
    export function success(message: string | ReactNode, options?: ToastOptions): string; 
    export function error(message: string | ReactNode, options?: ToastOptions): string;
    export function loading(message: string | ReactNode, options?: ToastOptions): string;
    export function dismiss(toastId?: string): void;
    export function remove(toastId: string): void;
    export function promise<T>(
        promise: Promise<T>,
        msgs: {
            loading: string | ReactNode;
            success: string | ReactNode;
            error: string | ReactNode;
        },
        opts?: ToastOptions
    ): Promise<T>;

    export const Toaster: React.FC<{
        position?: ToastOptions['position'];
        toastOptions?: ToastOptions;
        reverseOrder?: boolean;
        gutter?: number;
        containerStyle?: React.CSSProperties;
        containerClassName?: string;
        children?: ReactNode;
        theme?: 'light' | 'dark';
    }>;
}
