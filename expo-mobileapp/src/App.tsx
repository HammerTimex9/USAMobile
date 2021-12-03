import React, { useEffect } from "react";
import { AppNavigator } from "./navigation";
import { ExpertsProvider } from './contexts/expertsContext';


function App(): JSX.Element {

  return (
    <ExpertsProvider>
      <AppNavigator />
    </ExpertsProvider>
  );
}

export default App;