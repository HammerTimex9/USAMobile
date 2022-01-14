import React from 'react';
import ReactDOM from 'react-dom';
import { MoralisProvider } from 'react-moralis';

import { ExpertsProvider } from './contexts/expertsContext';
import { ColorModeProvider } from './contexts/colorModeContext';
import { NetworkProvider } from './contexts/networkContext';
import { PortfolioProvider } from './contexts/portfolioContext';
import { ActionsProvider } from './contexts/actionsContext';
import { QuoteProvider } from './contexts/quoteContext';
import App from './containers/App';
import reportWebVitals from './components/Support/reportWebVitals';

const appId = process.env.REACT_APP_MORALIS_APPLICATION_ID;
const serverUrl = process.env.REACT_APP_MORALIS_SERVER_URL;
// ReactDOM.render(
//   <React.StrictMode>
//     <MoralisProvider appId={appId} serverUrl={serverUrl}>
//       <App />
//     </MoralisProvider>
//   </React.StrictMode>,
//   document.getElementById('root')
// );

ReactDOM.render(
  <React.StrictMode>
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
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
