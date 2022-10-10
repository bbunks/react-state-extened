import { Dispatch, SetStateAction, useEffect, useState } from "react";

/**
 * A react hook used to store objects in local storage.
 * On page load it tries to get the value from local storage.
 * If it can not find it wil will st the default value to the first param.
 *
 * @constructor
 * @param {string} key - The key to be written into in local storage
 * @param {any} defaultValue - The default value returned
 */
export function useStickyState<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stickyValue = window.localStorage.getItem(key);
    return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue] as [T, Dispatch<SetStateAction<T>>];
}
