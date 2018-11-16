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

type WithApiSubscriptionState<T> = {
  [K in keyof SingleApiState<T>]: { [key: string]: SingleApiState<T>[K] };
};

/**
 * Fetcher configuration for the withApiSubscription HOC.`
 */
export interface FetcherConfig<P = {}, T = any> {
  /**
   * The `name` will be used as prop name for the fetch states.
   * If `name` is set to `myData` the HOC will pass in three props:
   * - `myData` with the fetched data
   * - `myDataError` with an error, if one has been thrown
   * - `myDataLoading` with a boolean that represents the loading state.
   */
  name: string;
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

export function withApiSubscription<P = {}, T = any>(
  WrappedComponent: React.ComponentClass | any, // or SFC
  apis: FetcherConfig<P, T>[]
) {
  return class WithApiSubscription extends React.Component<P, WithApiSubscriptionState<T>> {
    public static displayName = `WithApiSubscription(${getDisplayName(WrappedComponent)})`;
    public subscriptionId: string;

    constructor(props: P) {
      super(props);
      this.state = {
        data: this.getInitialApiState(undefined),
        error: this.getInitialApiState(null),
        loading: this.getInitialApiState(true)
      };
      this.subscriptionId = Math.random()
        .toString(36)
        .substr(2, 10);
    }

    private getInitialApiState<V>(value: V): { [key: string]: V } {
      return apis.reduce((acc, api) => ({ ...acc, [api.name]: value }), {});
    }

    private setSingleApiState(name: FetcherConfig<P, T>['name'], state: Partial<SingleApiState<T>>) {
      this.setState(prevState => {
        return Object.entries(state).reduce((newState, [stateKey, value]) => {
          const clonedState = { ...prevState[stateKey] };
          clonedState[name] = value;
          return { ...newState, [stateKey]: clonedState };
        },
        {}); // tslint:disable-line:align
      });
    }

    private async fetchSingleApiData(api: FetcherConfig<P, T>, isInitialLoad?: boolean): Promise<void> {
      const { name, waitFor = [] } = api;
      try {
        // Check if there are props, this api call is dependent on
        if (waitFor.some(prop => this.props[prop] === undefined)) {
          return;
        }
        // Set loading flag, if a reload is triggered
        if (!isInitialLoad) {
          this.setSingleApiState(name, { loading: true });
        }
        const data = await api.fetcher({}, this.props);
        this.setSingleApiState(name, { data, loading: false });
      } catch (error) {
        this.setSingleApiState(name, { error });
      }
    }

    private async getData(isInitialLoad: boolean): Promise<void> {
      await Promise.all(
        apis.map(api => this.fetchSingleApiData(api, isInitialLoad))
      );
    }

    private requiredPropsChanged(api: FetcherConfig<P, T>, prevProps: P, nextProps: P): boolean {
      return (api.waitFor || []).some(
        prop =>
          (prevProps[prop] === undefined && nextProps[prop] !== undefined) ||
          (prevProps[prop] !== undefined && nextProps[prop] === undefined)
      );
    }

    public async componentDidMount(): Promise<void> {
      await this.getData(true);
      apis.forEach(api => {
        (api.triggers || []).forEach(trigger =>
          triggerManager.addTrigger(
            trigger,
            `${api.name}-${this.subscriptionId}`,
            this.fetchSingleApiData.bind(this, api)
          )
        );
      });
    }

    public async componentDidUpdate(prevProps: P): Promise<void> {
      const refetches = apis
        .filter(api => this.requiredPropsChanged(api, prevProps, this.props))
        .map(api => this.fetchSingleApiData(api));

      await Promise.all(refetches);

      /* 
        Same behavior, but harder to read.
        We have to check which one is better, performance wise.

        await Promise.all(
          apis.reduce(
            (acc, api) =>
              this.requiredPropsChanged(api, prevProps, this.props)
                ? [...acc, this.fetchSingleApiData(api)]
                : acc,
            []
          )
        );
      */
    }

    public componentWillUnmount(): void {
      apis.forEach(api => {
        (api.triggers || []).forEach(trigger =>
          triggerManager.removeTrigger(
            trigger,
            `${api.name}-${this.subscriptionId}`
          )
        );
      });
    }

    public render(): JSX.Element {
      const { error, data, loading } = this.state;
      const props = apis.reduce(
        (acc, { name }) => Object.assign({}, acc, {
          [name]: data[name],
          [`${name}Error`]: error[name],
          [`${name}Loading`]: loading[name],
        }),
        this.props
      );
      return <WrappedComponent {...props} />;
    }
  };
}
