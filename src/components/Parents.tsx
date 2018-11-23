import * as React from 'react';
import { setters } from '../apis';

/** All props, that will not be provided by the HOC  */
export interface ParentProps {
  error: null | Error;
  data: number | undefined;
  color?: string;
}

export function Parents(props: ParentProps) {
  if (props.error) {
    console.error(props.error);
  }
  const msg =
    (props.error && 'Parents: Error') ||
    (props.data !== undefined && `Parents: ${props.data}`) ||
    'Parents: Loading';

  const color =
    (props.error && 'red') ||
    (props.data === undefined && 'orange') ||
    props.color ||
    'black';

  const buttonDisabled = !!(props.error || props.data === undefined);

  return (
    <>
      <pre style={{ color }}>{msg}</pre>
      <button onClick={setters.updateEntityParents} disabled={buttonDisabled}>
        Add parent
      </button>
    </>
  );
}