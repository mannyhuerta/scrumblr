import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom'
import { observer } from 'mobx-react';

import AdSense from 'react-adsense';
import Board from './components/Board/Board'
import Home from './components/Home/Home'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

  }
  shouldComponentUpdate(np, ns) {
    return true
  }
  render() {
    const { stores } = this.props
    const { REACT_APP_ADSENSE_SLOT, REACT_APP_ADSENSE_CLIENT } = process.env
    return stores.server.connected ?
      (

        <Switch>
          <Route exact path='/'
            render={({ match }) => (
              <div>
                <Home {...this.props} />
                {REACT_APP_ADSENSE_CLIENT && REACT_APP_ADSENSE_SLOT &&
                  <AdSense.Google
                    client={REACT_APP_ADSENSE_CLIENT}
                    slot={REACT_APP_ADSENSE_SLOT}
                    style={{ display: 'block' }}
                    format='auto'
                    responsive='true'
                  />
                }
              </div>
            )} />
          <Route path='/:name'
            render={({ match }) => (
              <Board {...this.props} match={match} />
            )} />
        </Switch>

      ) : <div>Connecting to server</div>
  }
}

export default observer(App);
