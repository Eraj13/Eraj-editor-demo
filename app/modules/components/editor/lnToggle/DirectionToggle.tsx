// DirectionToggle.tsx
'use client';

import React, { useState } from 'react';
import './DirectionToggle.css';

interface DirectionToggleProps {
  initialDirection?: 'ltr' | 'rtl';
  onToggle?: (direction: 'ltr' | 'rtl') => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const DirectionToggle: React.FC<DirectionToggleProps> = ({
  initialDirection = 'ltr',
  onToggle,
  position = 'top-right'
}) => {
  const [direction, setDirection] = useState<'ltr' | 'rtl'>(initialDirection);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const handleToggle = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const newDirection = direction === 'ltr' ? 'rtl' : 'ltr';
    
    // Trigger animation
    setTimeout(() => {
      setDirection(newDirection);
      onToggle?.(newDirection);
    }, 150);
    
    // Reset animation state
    setTimeout(() => setIsAnimating(false), 300);
  };
  
  // Get position classes
  const positionClasses = {
    'top-right': 'dir-toggle-top-right',
    'top-left': 'dir-toggle-top-left',
    'bottom-right': 'dir-toggle-bottom-right',
    'bottom-left': 'dir-toggle-bottom-left'
  };
  
  return (
    <button
      className={`direction-toggle ${positionClasses[position]} ${
        direction === 'rtl' ? 'rtl-active' : 'ltr-active'
      } ${isAnimating ? 'animating' : ''}`}
      onClick={handleToggle}
      title={direction === 'ltr' ? 'Switch to Arabic (RTL)' : 'Switch to English (LTR)'}
      aria-label={`Switch to ${direction === 'ltr' ? 'Arabic' : 'English'}`}
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
        {direction === 'ltr' ? 'Switch to فارسی' : 'Switch to English'}
      </div> */}
    </button>
  );
};

export default DirectionToggle;