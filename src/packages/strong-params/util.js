const hasArrayBuffer = typeof ArrayBuffer === "function";
const { toString } = Object.prototype;
const isBuffer = obj => Buffer.isBuffer(obj);
const isArrayBuffer = value => {
  return (
    hasArrayBuffer &&
    (value instanceof ArrayBuffer ||
      toString.call(value) === "[object ArrayBuffer]")
  );
};
export const cloneDeep = params => {
  if (!params) return params;
  if (params instanceof Object) return { ...params };
  if (params instanceof Array) return [...Array];
  return params;
};

export const isArray = array => Array.isArray(array);
export const isObject = object => object instanceof Object;
export const isNaN = value => Number.isNaN(value);

export const transform = (object, iteratee, accumulator) => {
  const isArr = Array.isArray(object);
  const isArrLike = isArr || isBuffer(object) || isArrayBuffer(object);

  if (accumulator == null) {
    const Ctor = object && object.constructor;
    if (isArrLike) {
      accumulator = isArr ? new Ctor() : [];
    } else if (isObject(object)) {
      accumulator =
        typeof Ctor === "function"
          ? Object.create(Object.getPrototypeOf(object))
          : {};
    } else {
      accumulator = {};
    }
  }
  (isArrLike ? arrayEach : baseForOwn)(object, (value, index, object) =>
    iteratee(accumulator, value, index, object)
  );
  return accumulator;
};
