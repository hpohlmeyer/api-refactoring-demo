
/**
 * A wrapped promise that can be cancel with the cancel method.
 */
export interface CancelablePromise<T> {
  promise: Promise<T>;
  cancel: () => void;
}

/**
 * Wraps a promise to make it cancelable.
 * Details: https://reactjs.org/blog/2015/12/16/ismounted-antipattern.html
 */
export function makeCancelable<T>(promise: Promise<T>): CancelablePromise<T> {
  let isCanceled = false;

  const wrappedPromise = new Promise<T>((resolve, reject) => {
    promise.then(
      val => isCanceled ? reject({isCanceled: true}) : resolve(val),
      error => isCanceled ? reject({isCanceled: true}) : reject(error)
    );
  });

  return {
    promise: wrappedPromise,
    cancel: () => isCanceled = true
  };
}
