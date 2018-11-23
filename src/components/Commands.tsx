import * as React from 'react';
import { setters } from '../apis';

export interface CommandProps {
  error: null | Error;
  data: number | undefined;
  color?: string;
}

export function Commands(props: CommandProps) {
  const msg =
    (props.error && 'Commands: Error') ||
    (props.data !== undefined && `Commands: ${props.data}`) ||
    'Loading';

  const color =
    (props.error && 'red') ||
    (props.data === undefined && 'orange') ||
    props.color ||
    'black';

  const buttonDisabled = !!(props.error || props.data === undefined);

  return (
    <>
      <pre style={{ color }}>{msg}</pre>
      <button onClick={setters.updateEntityCommands} disabled={buttonDisabled}>
        Add command and update parents
      </button>
    </>
  );
}
