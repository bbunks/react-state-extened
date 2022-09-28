import { useMemo, useState } from "react";

type KeyValuePair = { key: string; value: string | number };

/**
 * Saves and reads the state from the URL query string. Returns a list of key value pairs.
 *
 * @param {function} defaultState - State that will be included unless the a different value is stored in the qs
 */
function useQueryStringState(defaultState: KeyValuePair[] = [], options = {}) {
  //exists to force rerender on stateUpdate
  const [stateIndex, updateState] = useState(0);

  function getState() {
    const urlParams = new URLSearchParams(window.location.search.slice(1));

    const mappedKeyValues: KeyValuePair[] = [];
    const mappedObj: { [key: string]: string | number } = {};

    for (const ele of urlParams) {
      const valueIsNumeric = ele[1].search(/^[0-9]+$/) >= 0;

      mappedKeyValues.push({
        key: ele[0],
        value: valueIsNumeric ? Number(ele[1]) : ele[1],
      });
      mappedObj[ele[0]] = valueIsNumeric ? Number(ele[1]) : ele[1];
    }

    const defaultStateToInclude = defaultState.filter(
      (ele) => !(ele.key in mappedObj)
    );

    return [...mappedKeyValues, ...defaultStateToInclude];
  }

  const state = useMemo(getState, [stateIndex]);

  function setState(
    update: KeyValuePair[] | ((currentState: KeyValuePair[]) => KeyValuePair[])
  ) {
    let updatedList: KeyValuePair[] = [];

    if (typeof update === "function") {
      updatedList = update(state);
    } else if (Array.isArray(update)) {
      updatedList = update;
    }

    const queryObj: { [key: string]: string } = {};

    updatedList.forEach((ele) => {
      if (defaultState.find((fele) => ele.key === fele.key) !== ele)
        queryObj[ele.key] = ele.value.toString();
    });

    const SearchParams = new URLSearchParams(queryObj).toString();
    const paramString = SearchParams.length === 0 ? "" : `?${SearchParams}`;

    if (window.location.search !== paramString) {
      window.history.replaceState(null, "", location.pathname + paramString);
      updateState((prev) => prev + 1);
    }
  }

  //This makes the state return the same list so that you can use it in useEffects

  return [state, setState];
}

export default useQueryStringState;
