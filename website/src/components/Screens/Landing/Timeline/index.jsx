import React from 'react';
import { useLocation, Link } from 'react-router-dom';

import './styles.scss';

const STEPS = [
  { label: 'Create your USA Wallet Storage' },
  { label: 'Set up your User Account' },
  { label: 'Enable Polygon for cheap trades' },
  { label: 'Make your first Cryptocurrency purchase' },
];

const Timeline = ({ currentStep }) => {
  const location = useLocation();

  const arr = location.pathname.split('/').filter((str) => str);
  const step = arr.pop();

  return (
    <div className="landing-timeline">
      {STEPS.map((s, i) => {
        const index = i + 1;
        const classes = ['step'];

        if (index < currentStep) {
          classes.push('completed');
        } else if (index === currentStep) {
          classes.push('current');
        } else if (index > currentStep) {
          classes.push('disabled');
        }
        if (`step${index}` === step) {
          classes.push('selected');
        }

        return (
          <Link
            key={i}
            to={`/landing/step${index}`}
            className={classes.join(' ')}
          >
            <span className="number">{i + 1}</span>
            <span className="label">{s.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default Timeline;
