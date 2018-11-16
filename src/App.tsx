import * as React from 'react';
import { getters } from './apis';
import { withApiSubscription } from './hocs/withApiSubscription';
import { Commands, CommandCompProps } from './components/Commands';
import { Parents, ParentHocProps } from './components/Parents';
import { CommandAndParent, CommandAndParentCompProps } from './components/CommandAndParent';
import { FetcherConfig } from './hocs/withApiSubscription.js';

// PARENT COMPONENT WITH FETCH --------------------------------------------------
const parentSubscription: FetcherConfig<ParentHocProps, number> = {
  name: 'parents',
  fetcher: (routeParams, props) => getters.fetchEntityParents(props.someFetchDependency!),
  triggers: ['updateEntityCommands', 'updateEntityParents'],
  waitFor: ['someFetchDependency']
};
const ParentWithSub = withApiSubscription(Parents, [parentSubscription]);

// COMMAND COMPONENT WITH FETCH --------------------------------------------------
const commandSubscription: FetcherConfig<CommandCompProps, number> = {
  name: 'commands',
  fetcher: () => getters.fetchEntityCommands(),
  triggers: ['updateEntityCommands']
};

const CommandsWithSub = withApiSubscription(Commands, [commandSubscription]);

// COMMAND AND PARENT COMPONENT --------------------------------------------------
const CommandAndParentWithSub = withApiSubscription<CommandAndParentCompProps>(CommandAndParent, [
  parentSubscription,
  commandSubscription
]);

// APP COMPONENT -----------------------------------------------------------------
export class App extends React.Component<{}, { someFetchDependency?: boolean }> {
  constructor(props: {}) {
    super(props);
    this.state = { someFetchDependency: undefined };
  }

  componentDidMount() {
    // simulate prop that relies on data, that will be added after
    // the inital mount of the comonent.
    setTimeout(() => this.setState({ someFetchDependency: true }), 5000);
  }

  render() {
    return (
      <div className="App">
        <h1>Api Refactoring Demo</h1>
        <hr />
        <CommandAndParentWithSub
          someFetchDependency={this.state.someFetchDependency}
        />
        <hr />
        <CommandsWithSub />
        <hr />
        <ParentWithSub
          color="teal" // Passing other props is still possible
          someFetchDependency={this.state.someFetchDependency}
        />
        <hr />
      </div>
    );
  }
}