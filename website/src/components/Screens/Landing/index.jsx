import React from 'react';
import { Switch, Route, Redirect, useHistory } from 'react-router-dom';
import { Box } from '@mui/system';

import Timeline from './Timeline';
import Start from './Start';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import Step4 from './Step4';

const Landing = () => {
  const history = useHistory();
  const [currentStep, setCurrentStep] = React.useState(
    parseInt(localStorage.getItem('landing-step')) || 0
  );

  const nextStep = (step) => {
    if (step === currentStep + 1) {
      localStorage.setItem('landing-step', step);
      setCurrentStep(step);
    }
    if (step < 5) {
      history.push(`/landing/step${step}`);
    }
  };

  const LandingRoute = ({ component: Component, step, ...rest }) => {
    return (
      <Route
        {...rest}
        exact
        render={() => {
          return step > currentStep ? (
            <Redirect to={`/landing/step${currentStep}`} />
          ) : (
            <Component onNext={nextStep} />
          );
        }}
      />
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '100px 10px',
        minHeight: '100vh',
        backgroundColor: '#fff',
        color: '#1a202c',
        textAlign: 'center',
      }}
    >
      <Timeline currentStep={currentStep} />

      <Box mt={5} sx={{ maxWidth: 700 }}>
        <Switch>
          <LandingRoute path="/landing/step0" step={0} component={Start} />
          <LandingRoute path="/landing/step1" step={1} component={Step1} />
          <LandingRoute path="/landing/step2" step={2} component={Step2} />
          <LandingRoute path="/landing/step3" step={3} component={Step3} />
          <LandingRoute path="/landing/step4" step={4} component={Step4} />
          <Redirect to="/landing/step0" />
        </Switch>
      </Box>
    </Box>
  );
};

export default Landing;
