import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export { convertImageToBase64 } from "./converters.utils";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
