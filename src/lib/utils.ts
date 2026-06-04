import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Shadcn Svelte 5 helper types
export type WithElementRef<T, E = HTMLElement> = T & {
  ref?: E | null;
};

export type WithoutChildrenOrChild<T> = Omit<T, 'children' | 'child'>;
export type WithoutChild<T> = Omit<T, 'child'>;
export type WithoutChildren<T> = Omit<T, 'children'>;

export function replacePathParams(path: string, params: Record<string, string>): string {
  return path.replace(/\[([^\]]+)]/g, (_, key) => {
    if (!(key in params)) {
      throw new Error(`Missing value for path param: ${key}`);
    }
    return encodeURIComponent(params[key]);
  });
}

export function percentageToRate(value: number) {
  return Number((value / 100).toFixed(6));
}

export function rateToPercentage(value: number) {
  return Number((value * 100).toFixed(2));
}
