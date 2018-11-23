import * as React from 'react';
import { getters } from './apis';
import { Commands } from './components/Commands';
import { Parents } from './components/Parents';
import { CommandAndParent } from './components/CommandAndParent';
import { ApiSubscription } from './components/ApiSubscription';

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
        <ApiSubscription<number>
          apiGetter={getters.fetchEntityCommands}
          subscribeTo={['updateEntityParents', 'updateEntityCommands']}
        >
          {(commands) => (
            <ApiSubscription<number>
              waitingForDependencies={!this.state.someFetchDependency}
              apiGetter={() => getters.fetchEntityParents(this.state.someFetchDependency!)}
              subscribeTo={['updateEntityParents', 'updateEntityCommands']}
            >
              {(parents) => (
                <CommandAndParent
                  parentsError={parents.error}
                  parents={parents.data}
                  commandsError={commands.error}
                  commands={commands.data}
                />
              )}
            </ApiSubscription>
          )}
        </ApiSubscription>
        <hr />
        <ApiSubscription<number>
          apiGetter={getters.fetchEntityCommands}
          subscribeTo={['updateEntityCommands']}
        >
          {(subState) => <Commands {...subState} />}
        </ApiSubscription>
        <hr />
        <ApiSubscription<number>
          waitingForDependencies={!this.state.someFetchDependency}
          apiGetter={() => getters.fetchEntityParents(this.state.someFetchDependency!)}
          subscribeTo={['updateEntityParents', 'updateEntityCommands']}
        >
          {(subState) => <Parents color="teal" {...subState} />}
        </ApiSubscription>
        <hr />
      </div>
    );
  }
}