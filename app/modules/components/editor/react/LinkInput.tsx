'use client';
import { useEffect, useRef, useState } from "react";
import './MyText.css';

export  const LinkInput = ({
  position,
  onSubmit,
  onCancel
}: {
  position?: { top: number; left: number };
  onSubmit: (url: string) => void;
  onCancel: () => void;
}) => {
  const [url, setUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (url) onSubmit(url);
    setUrl('');
  };

  return (
    <div 
      className="link-input"
      style={{
        position: 'absolute',
        top: `${position?.top}px`,
        left: `${position?.left}px`
      }}
      id="LinkInput"
    >
      <input
        ref={inputRef}
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder="Enter URL"
      />
      <button className="link-input_button_add" onClick={handleSubmit}>Apply</button>
      <button className="link-input_button link-input_button_cross" onClick={onCancel}>×</button>
    </div>
  );
};