// components/SaveNotification.tsx
import React, { useEffect } from 'react';
import './SaveNotification.css';
import { SaveNotificationProps } from '../core/types';


export const SaveNotification: React.FC<SaveNotificationProps> = ({
  onNotification,
  duration = 2000,
  onHide
}) => {
  useEffect(() => {
    if (onNotification?.show) {
      const timer = setTimeout(() => {
        onHide?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [onNotification.show, duration, onHide]);
  
  if (!onNotification.show) return null;
  
  return (
    <div className="save-notification">
      <span className="save-icon">✓</span>
      <span>{onNotification.message}</span>
    </div>
  );
};