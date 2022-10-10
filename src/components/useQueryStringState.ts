import { useMemo, useState } from "react";

type QueryStringObject = { [key: string]: number | string | object };
type EncodeQueryStringObject = {
  result: { [key: string]: string };
  decodeKey: EncodeTypeId[];
};

type EncodeTypeId = "s" | "n" | "o";

/**
 * Saves and reads the state from the URL query string. Returns a list of key value pairs.
 *
 * @param {QueryStringObject} defaultState - State that will be included unless the a different value is stored in the qs
 */
export function useQueryStringState<T extends QueryStringObject>(
  defaultState: T
) {
  //exists to force rerender on stateUpdate
  const [stateIndex, updateState] = useState(0);

  function getState() {
    const urlParams = new URLSearchParams(window.location.search.slice(1));

    const mappedObj: { [key: string]: string } = {};
    let decodeKey: EncodeTypeId[] = [];

    for (const ele of urlParams) {
      if (ele[0] === "QSSDK") {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        decodeKey = ele[1].split("");
      } else {
        mappedObj[ele[0]] = ele[1];
      }
    }

    const storedState = decodeQSObject(mappedObj, decodeKey);

    return { ...defaultState, ...storedState } as T;
  }

  //This makes the state return the same list so that you can use it in useEffects
  const state = useMemo(getState, [stateIndex]);

  function setState(update: T | ((currentState: T) => T)) {
    let updatedObj: QueryStringObject = {};

    if (typeof update === "function") {
      updatedObj = { ...update(state) };
    } else if (typeof update === "object") {
      updatedObj = { ...update };
    }

    const cleanObj: any = {};
    Object.keys(updatedObj).forEach((name) => {
      if (
        !(name in defaultState) ||
        JSON.stringify(updatedObj[name]) !== JSON.stringify(defaultState[name])
      )
        cleanObj[name] = updatedObj[name];
    });

    writeToURL(encodeQSObject(cleanObj), () => {
      updateState((e) => e + 1);
    });
  }

  return [state, setState] as [
    T,
    (update: T | ((currentState: T) => T)) => void
  ];
}

function decodeQSItem(value: string, type: EncodeTypeId) {
  switch (type) {
    case "s":
      return value;
    case "n":
      return parseFloat(value);
    case "o":
      return JSON.parse(value);
    default:
      return value;
  }
}

function decodeQSObject(
  obj: { [key: string]: string },
  decodeKey: EncodeTypeId[] // a list of type ids stored as a string
): QueryStringObject {
  const decodedObj: QueryStringObject = {};
  Object.keys(obj).forEach((key, index) => {
    const type = decodeKey[index];
    decodedObj[key] = decodeQSItem(obj[key], type);
  });
  return decodedObj;
}

function encodeQSItem(value: string | number | object): {
  result: string;
  decodeTypeId: EncodeTypeId;
} {
  switch (typeof value) {
    case "string":
      return { result: value, decodeTypeId: "s" };
    case "number":
      return { result: value.toString(), decodeTypeId: "n" };
    case "object":
      return { result: JSON.stringify(value), decodeTypeId: "o" };
    default:
      return { result: JSON.stringify(value), decodeTypeId: "o" };
  }
}

function encodeQSObject(obj: QueryStringObject): EncodeQueryStringObject {
  const result: { [key: string]: string } = {};
  const decodeKey: EncodeTypeId[] = [];

  Object.keys(obj).forEach((ele) => {
    const encodedElement = encodeQSItem(obj[ele]);
    result[ele] = encodedElement.result;
    decodeKey.push(encodedElement.decodeTypeId);
  });

  return {
    result,
    decodeKey,
  };
}

function writeToURL(
  obj: EncodeQueryStringObject,
  onSuccess: () => void = () => {}
) {
  let paramString = "";

  if (obj.decodeKey.length > 0) {
    const queryObj: { [key: string]: string } = {
      ...obj.result,
      QSSDK: obj.decodeKey.join(""),
    };

    const SearchParams = new URLSearchParams(queryObj).toString();
    paramString = SearchParams.length === 0 ? "" : `?${SearchParams}`;
  }

  if (window.location.search !== paramString) {
    window.history.replaceState(null, "", location.pathname + paramString);
    onSuccess();
  }
}
