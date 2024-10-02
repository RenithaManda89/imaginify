/* eslint-disable prefer-const */
/* eslint-disable no-prototype-builtins */
import { type ClassValue, clsx } from "clsx";
import qs from "qs";
import { twMerge } from "tailwind-merge";

import { aspectRatioOptions } from "@/constants";

// Class Name Merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ERROR HANDLER
// ERROR HANDLER
export function handleError(error: unknown) {
  if (error instanceof Error) {
    console.error("Error:", error.message, "Stack:", error.stack);

    // Check for specific MongoDB-related errors
    if (error.message.includes("MongoDB connection failed")) {
      console.error("Database connection error. Please check your connection string and network access.");
      return; // Handle gracefully, but do not re-throw
    }

    if (error.message === "User not found") {
      // Handle this error gracefully, maybe return a default value or display a user-friendly message
      return; // Exit the function, no need to re-throw
    }

    throw new Error(`Error: ${error.message}`); // Re-throw for other critical errors
  } else if (typeof error === "string") {
    console.error("Error:", error);
    throw new Error(`Error: ${error}`);
  } else {
    console.error("Unexpected error type:", error);
    throw new Error("An unexpected error occurred.");
  }
}






// PLACEHOLDER LOADER - while image is transforming
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#7986AC" offset="20%" />
      <stop stop-color="#68769e" offset="50%" />
      <stop stop-color="#7986AC" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#7986AC" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);

export const dataUrl = `data:image/svg+xml;base64,${toBase64(
  shimmer(1000, 1000)
)}`;
// ==== End

// FORM URL QUERY
interface FormUrlQueryParams {
  searchParams: URLSearchParams;
  key: string;
  value: string | number | null;
}

export const formUrlQuery = ({
  searchParams,
  key,
  value,
}: FormUrlQueryParams): string => {
  const params = { ...qs.parse(searchParams.toString()), [key]: value };

  return `${window.location.pathname}?${qs.stringify(params, {
    skipNulls: true,
  })}`;
};

// REMOVE KEY FROM QUERY
interface RemoveUrlQueryParams {
  searchParams: string;
  keysToRemove: string[];
}

export function removeKeysFromQuery({
  searchParams,
  keysToRemove,
}: RemoveUrlQueryParams): string {
  const currentUrl = qs.parse(searchParams);

  keysToRemove.forEach((key) => {
    delete currentUrl[key];
  });

  // Remove null or undefined values
  Object.keys(currentUrl).forEach(
    (key) => currentUrl[key] == null && delete currentUrl[key]
  );

  return `${window.location.pathname}?${qs.stringify(currentUrl)}`;
}

// DEBOUNCE
export const debounce = <T extends unknown[]>(
  func: (...args: T) => void,
  delay: number
) => {
  let timeoutId: NodeJS.Timeout | null = null;
  return (...args: T) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay); // Using spread operator
  };
};



// IMAGE SIZE
export type AspectRatioKey = keyof typeof aspectRatioOptions;

interface Image {
  aspectRatio: string;
  width?: number;
  height?: number;
}

export const getImageSize = (
  type: string,
  image: Image,
  dimension: "width" | "height"
): number => {
  if (type === "fill") {
    return (
      aspectRatioOptions[image.aspectRatio as AspectRatioKey]?.[dimension] || 1000
    );
  }
  return image?.[dimension] || 1000;
};

// DOWNLOAD IMAGE
export const download = (url: string, filename: string) => {
  if (!url) {
    throw new Error("Resource URL not provided! You need to provide one");
  }

  fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const blobURL = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobURL;

      if (filename && filename.length)
        a.download = `${filename.replace(" ", "_")}.png`;
      document.body.appendChild(a);
      a.click();
    })
    .catch((error) => console.log({ error }));
};

// DEEP MERGE OBJECTS
export const deepMergeObjects = (
  obj1: Record<string, unknown>,
  obj2: Record<string, unknown>
): Record<string, unknown> => {
  if (obj2 === null || obj2 === undefined) {
    return obj1;
  }

  let output = { ...obj2 };

  for (let key in obj1) {
    if (obj1.hasOwnProperty(key)) {
      if (
        obj1[key] &&
        typeof obj1[key] === "object" &&
        obj2[key] &&
        typeof obj2[key] === "object"
      ) {
        output[key] = deepMergeObjects(
          obj1[key] as Record<string, unknown>,
          obj2[key] as Record<string, unknown>
        );
      } else {
        output[key] = obj1[key];
      }
    }
  }

  return output;
};
