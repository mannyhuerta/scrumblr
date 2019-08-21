import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import queryString from 'query-string'
import { DragDropContextProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import App from './App';
import stores from './stores'
require('dotenv').config()

const redirectUri = `${window.location.protocol}//${window.location.hostname}:${window.location.port}${window.location.pathname}`
const code = queryString.parse(window.location.search).code

stores.server.connected = false
stores.server.code = code
stores.server.redirectUri = redirectUri

ReactDOM.render(<DragDropContextProvider backend={HTML5Backend}>
    <Router><App stores={stores} /></Router>
</DragDropContextProvider>, document.getElementById('root'));
