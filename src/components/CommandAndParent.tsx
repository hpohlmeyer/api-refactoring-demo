import * as React from 'react';

/**
 * Parents that will be added by the HOC.
 * They need to be a separate interface, util typescript
 * is able to use computed interface keys.
 */
export interface CommandAndParentApiProps {
  parentsError: null | Error;
  parentsLoading: boolean;
  parents: number;
  commandsError: null | Error;
  commandsLoading: boolean;
  commands: number;
}

/** All props, that will not be provied by the HOC  */
export interface CommandAndParentCompProps {
  color?: string;
  someFetchDependency?: boolean;
}

/**
 * This interface is used to add additional props to the HOC, which
 * are not part of the actual component.
 * Usually these are dependencies that are used for fetching in the HOC.
 */
export interface CommandAndParentHocProps extends CommandAndParentCompProps {
  someFetchDependency?: boolean;
}

/**
 * All props that are available on this component, when it is not
 * wrapped by a HOC.
 */
type CommandAndParentProps = CommandAndParentApiProps & CommandAndParentCompProps;

export function CommandAndParent(props: CommandAndParentProps) {
  const parentMsg =
    (props.parentsError && 'Error') ||
    (props.parentsLoading && 'Loading') ||
    (props.parents !== undefined && props.parents.toString()) ||
    'Props not defined';

  const commandMsg =
    (props.commandsError && 'Error') ||
    (props.commandsLoading && 'Loading') ||
    (props.commands !== undefined && props.commands.toString()) ||
    'Props not defined';

  const parentColor =
    (props.parentsError && 'red') ||
    (props.parentsLoading && 'orange') ||
    props.color ||
    'black';

  const commandColor =
    (props.commandsError && 'red') ||
    (props.commandsLoading && 'orange') ||
    props.color ||
    'black';

  return (
    <pre>
      <div style={{ color: parentColor }}>{`Parents: ${parentMsg}`}</div>
      <div style={{ color: commandColor }}>{`Commands: ${commandMsg}`}</div>
    </pre>
  );
}
