import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMm(n: number): string {
  return `${Math.round(n)} mm`;
}

export function formatQty(n: number): string {
  return new Intl.NumberFormat("en-IN").format(Math.round(n));
}
