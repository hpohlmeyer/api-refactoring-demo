import * as React from 'react';
import { triggerManager } from '../state/triggerManager';
import { getDisplayName } from '../utils/getDisplayName';
import { ApiSetterName } from '../apis';

/** The state of a single API fetcher */
interface SingleApiState<T> {
  data: undefined | T;
  error: null | Error;
  loading: boolean;
}

/**
 * Fetcher configuration for the withApiSubscription HOC.`
 */
export interface SimpleFetcherConfig<P = {}, T = any> {
  /**
   * The function that fetches the data
   */
  fetcher: (routeParams: {}, props: P) => (Promise<T> | T);
  /**
   * A set of api setters, that trigger the fetcher, when they will be called
   */
  triggers?: ApiSetterName[];
  /**
   * A set of properties to wait for. Can be used to ensure that a prop is set,
   * before calling the fetcher.
   */
  waitFor?: (keyof P)[];
}

export function withSimpleApiSubscription<P = {}, T = any>(
  WrappedComponent: React.ComponentClass | any, // or SFC
  api: SimpleFetcherConfig<P, T>
) {
  return class WithApiSubscription extends React.Component<P, SingleApiState<T>> {
    public static displayName = `WithSimpleApiSubscription(${getDisplayName(WrappedComponent)})`;
    public subscriptionId: string;

    constructor(props: P) {
      super(props);
      this.state = {
        data: undefined,
        error: null,
        loading: true
      };
      this.subscriptionId = Math.random()
        .toString(36)
        .substr(2, 10);
    }

    private async getData(isInitialLoad?: boolean): Promise<void> {
      const { waitFor = [] } = api;
      try {
        // Check if there are props, this api call is dependent on
        if (waitFor.some(prop => this.props[prop] === undefined)) {
          return;
        }
        // Set loading flag, if a reload is triggered
        if (!isInitialLoad) {
          this.setState({ loading: true });
        }
        const data = await api.fetcher({}, this.props);
        this.setState({ data, loading: false });
      } catch (error) {
        this.setState({ error });
      }
    }

    private requiredPropsChanged(prevProps: P, nextProps: P): boolean {
      return (api.waitFor || []).some(
        prop =>
          (prevProps[prop] === undefined && nextProps[prop] !== undefined) ||
          (prevProps[prop] !== undefined && nextProps[prop] === undefined)
      );
    }

    public async componentDidMount(): Promise<void> {
      await this.getData(true);
      (api.triggers || []).forEach(trigger =>
        triggerManager.addTrigger(
          trigger,
          this.subscriptionId,
          this.getData.bind(this)
        )
      );
    }

    public async componentDidUpdate(prevProps: P): Promise<void> {
      if (this.requiredPropsChanged(prevProps, this.props)) {
        this.getData();
      }
    }

    public componentWillUnmount(): void {
      (api.triggers || []).forEach(trigger =>
        triggerManager.removeTrigger(trigger, this.subscriptionId)
      );
    }

    public render(): JSX.Element {
      const { error, data, loading } = this.state;
      if (error) {
        return <div>Error!</div>;
      }

      if (loading) {
        return <div>Loading</div>;
      }

      if (data === undefined) {
        throw new Error('Unexpected Error! This should not happen.');
      }

      return <WrappedComponent {...this.props} />;
    }
  };
}
