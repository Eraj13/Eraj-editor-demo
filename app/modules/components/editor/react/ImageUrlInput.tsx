/* eslint-disable @next/next/no-img-element */
'use client';
import { ImageUrlInputProps } from '../core/types';
import './ImageUrlInput.css'
import React, { useState, useRef, useEffect } from 'react';

export const ImageUrlInput: React.FC<ImageUrlInputProps> = ({
  isOpen,
  onClose,
  onInsert,
}) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleInsert = () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError('Please enter an image URL');
      return;
    }

    // ✅ Basic URL validation
    try {
      new URL(trimmedUrl);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    // ✅ Extract filename from URL
    const filename = trimmedUrl.split('/').pop() || 'image.jpg';
    
    onInsert(trimmedUrl, filename);
    setUrl('');
    setError('');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleInsert();
    }
    if (e.key === 'Escape') {
      onClose();
      setUrl('');
      setError('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="image-url-overlay" onClick={onClose}>
      <div className="image-url-modal" onClick={(e) => e.stopPropagation()}>
        <div className="image-url-header">
          <span className="image-url-icon">🔗</span>
          <h3>Insert Image URL</h3>
          <button className="image-url-close" onClick={onClose}>×</button>
        </div>

        <div className="image-url-body">
          <p className="image-url-hint">
            Enter the URL of an image hosted online (e.g., Cloudinary, Imgur, your own server)
          </p>
          <input
            ref={inputRef}
            type="url"
            className={`image-url-input ${error ? 'error' : ''}`}
            placeholder="https://example.com/images/photo.jpg"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError('');
            }}
            onKeyDown={handleKeyDown}
          />
          {error && <div className="image-url-error">{error}</div>}
          <div className="image-url-preview">
            {url && !error && (
              <>
                <span className="preview-label">Preview:</span>
                <img
                  src={url}
                  alt="Preview"
                  className="preview-image"
                  onError={() => setError('Image failed to load. Check the URL.')}
                />
              </>
            )}
          </div>
        </div>

        <div className="image-url-footer">
          <button className="image-url-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="image-url-insert" onClick={handleInsert}>
            Insert
          </button>
        </div>
      </div>
    </div>
  );
};