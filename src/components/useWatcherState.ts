import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { Watcher } from "wal.js";

/**
 * A react hook used to convert a Watcher from wal.js to react states.
 *
 * @constructor
 * @param {Watcher} watcher - A watcher that will be written to and read from
 */
export function useWatcherState<T>(watcher: Watcher<T>) {
  //exists to force rerender on stateUpdate
  const [stateIndex, updateState] = useState(0);

  function getState() {
    return watcher.value;
  }

  function setState(update: T | ((prev: T) => T)) {
    let updateFunction = typeof update !== "function" ? () => update : update;

    // this is ignored. Functions being stored in this is unlikely,
    // and if it is, this happens in react which this is a stand in for.
    //
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    let newValue = updateFunction(watcher.value);

    if (newValue !== watcher.value) {
      watcher.value = newValue;
    }
  }

  //trigger state update when watched value changes
  watcher.addListener(() => {
    updateState((prev) => prev + 1);
  });

  //This makes the state return the same list so that you can use it in useEffects
  const state = useMemo(getState, [stateIndex]);

  return [state, setState] as [T, Dispatch<SetStateAction<T>>];
}
