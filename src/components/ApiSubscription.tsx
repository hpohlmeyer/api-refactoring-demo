import * as React from 'react';
import { triggerManager } from '../state/triggerManager';
import { ApiSetterName } from '../apis';

interface ApiSubscriptionState<T> {
  /** An error that may get thrown during the apiGetter call. Otherwise it is `null` */
  error: null | Error;
  /** The data returned from the apiGetter. `undefined` while loading or in case of an error. */
  data: T | undefined;
}

interface ApiSubscriptionProps<T> {
  /** If set to `true` it postpones API calls until it changes to `false`. */
  waitingForDependencies?: boolean;
  /** The asynchonous API method, whose data will be passed the the cild function. */
  apiGetter: () => Promise<T>;
  /** A list of api getter methods that trigger a call to the `apiGetter`. */
  subscribeTo?: ApiSetterName[];
  /** A function that returns children, which can work with the provided api data. */
  children: (subscriptionState: ApiSubscriptionState<T>) => React.ReactNode;
}

/**
 * A wrapper component that handles api fetches.
 * It also alows to automatically handle the rerendering in case specific setters have been called.
 */
export class ApiSubscription<T> extends React.Component<ApiSubscriptionProps<T>, ApiSubscriptionState<T>> {
  public subscriptionId: string;
  
  constructor(props: ApiSubscriptionProps<T>) {
    super(props);
    this.subscriptionId = Math.random().toString(36).substr(2, 10);
    this.state = {
      error: null,
      data: undefined
    };
  }

  private async getData(isInitialLoad?: boolean): Promise<void> {
    if (this.props.waitingForDependencies) {
      return;
    }

    try {
      // Enforce loading state, if a reload is triggered
      if (!isInitialLoad) {
        this.setState({ data: undefined });
      }
      const data = await this.props.apiGetter();
      this.setState({ data });
    } catch (error) {
      this.setState({ error });
    }
  }

  public async componentDidMount(): Promise<void> {
    await this.getData(true);
    (this.props.subscribeTo || []).forEach(trigger =>
      triggerManager.addTrigger(
        trigger,
        this.subscriptionId,
        this.getData.bind(this)
      )
    );
  }

  public async componentDidUpdate(prevProps: ApiSubscriptionProps<T>): Promise<void> {
    if (prevProps.waitingForDependencies !== this.props.waitingForDependencies) {
      this.getData();
    }
  }

  public componentWillUnmount(): void {
    (this.props.subscribeTo || []).forEach(trigger =>
      triggerManager.removeTrigger(trigger, this.subscriptionId)
    );
  }

  public render(): React.ReactNode {
    const { error, data } = this.state;

    return this.props.children({ error, data });
  }
}