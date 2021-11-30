import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { MoralisProvider } from 'react-moralis';

import { ExpertsProvider } from './contexts/expertsContext';
import { ColorModeProvider } from './contexts/colorModeContext';
import { NetworkProvider } from './contexts/networkContext';
import { PortfolioProvider } from './contexts/portfolioContext';
import { ActionsProvider } from './contexts/actionsContext';
import { QuoteProvider } from './contexts/quoteContext';
import App from './components/App';
import reportWebVitals from './components/Support/reportWebVitals';

const appId = 'giVlpdXNLyuhimWSJm4JKmuHb5avCo9DpoPZftJ9';
const serverUrl = 'https://19vhqyfouejb.usemoralis.com:2053/server';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <MoralisProvider appId={appId} serverUrl={serverUrl}>
        <ExpertsProvider>
          <ColorModeProvider>
            <NetworkProvider>
              <PortfolioProvider>
                <ActionsProvider>
                  <QuoteProvider>
                    <App />
                  </QuoteProvider>
                </ActionsProvider>
              </PortfolioProvider>
            </NetworkProvider>
          </ColorModeProvider>
        </ExpertsProvider>
      </MoralisProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
