import * as React from 'react';
import { setters } from '../apis';

/**
 * Parents that will be added by the HOC.
 * They need to be a separate interface, util typescript
 * is able to use computed interface keys.
 */
export interface CommandApiProps {
  commandsError: null | Error;
  commandsLoading: boolean;
  commands: number;
}

/** All props, that will not be provied by the HOC  */
export interface CommandCompProps {
  color?: string;
}

/**
 * This interface is used to add additional props to the HOC, which
 * are not part of the actual component.
 * Usually these are dependencies that are used for fetching in the HOC.
 */
type CommandProps = CommandApiProps & CommandCompProps;

export function Commands(props: CommandProps) {
  const msg =
    (props.commandsError && 'Commands: Error') ||
    (props.commandsLoading && 'Commands: Loading') ||
    (props.commands !== undefined && `Commands: ${props.commands}`) ||
    'Error while loading commands due to missing props';

  const color =
    (props.commandsError && 'red') ||
    (props.commandsLoading && 'orange') ||
    props.color ||
    'black';

  const buttonEnabled = props.commandsError || props.commandsLoading;

  return (
    <>
      <pre style={{ color }}>{msg}</pre>
      <button onClick={setters.updateEntityCommands} disabled={!!buttonEnabled}>
        Add command and update parents
      </button>
    </>
  );
}
