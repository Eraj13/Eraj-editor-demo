import React from 'react';
import { ActiveMarks } from '../core/types';
import './MyText.css';

interface FormatToolbarProps {
  position?: { top: number; left: number };
  onFormat: (command: keyof ActiveMarks, value?: string) => void;
  onLinkCreate: () => void; 
}

export const FormatToolbar = React.memo(function FormatToolbar({
  position,
  onFormat,
  onLinkCreate
}: FormatToolbarProps) {
  return (
    <div 
      className="format-toolbar"
      style={{
        position: 'absolute',
        top: `${position?.top}px`,
        left: `${position?.left}px`,
        zIndex: 100
      }}
      id='FormatToolbar'
    >
      <button className='format-toolbar_button' onClick={() => onFormat('bold')}>B</button>
      <button className='format-toolbar_button' onClick={() => onFormat('italic')}>I</button>
      <button className='format-toolbar_button' onClick={() => onLinkCreate()}>Link</button>
      {/* <button onClick={() => onFormat('blockquote')}>
        Quote
      </button> */}
    </div>
  );
});

FormatToolbar.displayName = 'FormatToolbar';