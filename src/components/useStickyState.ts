import { Dispatch, SetStateAction, useEffect, useState } from "react";

/**
 * A react hook used to store objects in local storage.
 * On page load it tries to get the value from local storage.
 * If it can not find it wil will st the default value to the first param.
 *
 * @constructor
 * @param {any} defaultValue - The default value returned
 * @param {string} key - The key to be written into in local storage
 */
function useStickyState<T>(defaultValue: T, key: string) {
  const [value, setValue] = useState<T>(() => {
    const stickyValue = window.localStorage.getItem(key);
    return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue] as [T, Dispatch<SetStateAction<T>>];
}

export { useStickyState };
