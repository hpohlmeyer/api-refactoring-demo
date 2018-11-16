import * as React from 'react';
import { setters } from '../apis';

/**
 * Parents that will be added by the HOC.
 * They need to be a separate interface, util typescript
 * is able to use computed interface keys.
 */
export interface ParentApiProps {
  parentsError: null | Error;
  parentsLoading: boolean;
  parents: number;
}

/** All props, that will not be provied by the HOC  */
export interface ParentCompProps {
  color?: string;
}

/**
 * This interface is used to add additional props to the HOC, which
 * are not part of the actual component.
 * Usually these are dependencies that are used for fetching in the HOC.
 */
export interface ParentHocProps extends ParentCompProps {
  someFetchDependency?: boolean;
}

/**
 * All props that are available on this component, when it is not
 * wrapped by a HOC.
 */
type ParentProps = ParentApiProps & ParentCompProps;

export function Parents(props: ParentProps) {
  const msg =
    (props.parentsError && 'Parents: Error') ||
    (props.parentsLoading && 'Parents: Loading') ||
    (props.parents !== undefined && `Parents: ${props.parents}`) ||
    'Error while loading parents due to missing props';

  const color =
    (props.parentsError && 'red') ||
    (props.parentsLoading && 'orange') ||
    props.color ||
    'black';

  const buttonEnabled = props.parentsError || props.parentsLoading;

  return (
    <>
      <pre style={{ color }}>{msg}</pre>
      <button onClick={setters.updateEntityParents} disabled={!!buttonEnabled}>
        Add parent
      </button>
    </>
  );
}
