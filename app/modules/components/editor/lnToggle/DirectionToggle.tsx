// DirectionToggle.tsx
'use client';

import React from 'react';
import './DirectionToggle.css';
import { positionClasses } from '../utils/constants';
import { DirectionToggleProps } from '../core/types';


// const DirectionToggle: React.FC<DirectionToggleProps> = ({
//   initialDirection = 'ltr',
//   onToggle,
//   position = 'top-right'
// }) => {

const DirectionToggle: React.FC<DirectionToggleProps> = ({
  onToggle,
  position = 'top-right',
  onAnimation,
  onDirection
}) => {
  // const [direction, setDirection] = useState<'ltr' | 'rtl'>(initialDirection);
  // const [onAnimation, setIsAnimating] = useState(false);
  
  // const handleToggle = () => {
  //   if (onAnimation) return;
    
  //   setIsAnimating(true);
  //   const newDirection = direction === 'ltr' ? 'rtl' : 'ltr';
    
  //   // Trigger animation
  //   setTimeout(() => {
  //     setDirection(newDirection);
  //     onToggle?.(newDirection);
  //   }, 150);
    
  //   // Reset animation state
  //   setTimeout(() => setIsAnimating(false), 300);
  // };
  
  
  return (
    <button
      className={`direction-toggle ${positionClasses[position]} ${
        onDirection === 'rtl' ? 'rtl-active' : 'ltr-active'
      } ${onAnimation ? 'animating' : ''}`}
      onClick={onToggle}
      title={onDirection === 'ltr' ? 'Switch to Farsi (RTL)' : 'Switch to English (LTR)'}
      aria-label={`Switch to ${onDirection === 'ltr' ? 'Arabic' : 'English'}`}
      type="button"
    >
      <div className="toggle-content">
        <span className="lang-en" aria-hidden="true">
          EN
        </span>
        <span className="lang-fa" aria-hidden="true">
          FA
        </span>
        <div className="toggle-slider" />
      </div>
      
      {/* Tooltip */}
      {/* <div className="toggle-tooltip">
        {onDirection === 'ltr' ? 'Switch to فارسی' : 'Switch to English'}
      </div> */}
    </button>
  );
};

export default DirectionToggle;