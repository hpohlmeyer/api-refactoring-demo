import * as React from 'react';

export interface CommandAndParentProps {
  parentsError: null | Error;
  parents: number | undefined;
  commandsError: null | Error;
  commands: number | undefined;
  color?: string;
}

export function CommandAndParent(props: CommandAndParentProps) {
  const parentMsg =
    (props.parentsError && 'Error') ||
    (props.parents !== undefined && props.parents.toString()) ||
    'Loading';

  const commandMsg =
    (props.commandsError && 'Error') ||
    (props.commands !== undefined && props.commands.toString()) ||
    'Loading';

  const parentColor =
    (props.parentsError && 'red') ||
    (props.parents === undefined && 'orange') ||
    props.color ||
    'black';
    
  const commandColor =
    (props.commandsError && 'red') ||
    (props.commands === undefined && 'orange') ||
    props.color ||
    'black';

  return (
    <pre>
      <div style={{ color: parentColor }}>{`Parents: ${parentMsg}`}</div>
      <div style={{ color: commandColor }}>{`Commands: ${commandMsg}`}</div>
    </pre>
  );
}
