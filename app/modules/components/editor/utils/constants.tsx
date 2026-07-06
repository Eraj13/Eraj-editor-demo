// components/ListIcons.tsx
'use client';

import React from 'react';


export const STORAGE_KEY = 'editor-draft';

// ✅ Tiny 1x1 transparent GIF (44 bytes)
export const PLACEHOLDER_IMAGE =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

// ✅ Or a subtle loading placeholder (colored square)
export const LOADING_PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f3f4f6"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12"%3ELoading...%3C/text%3E%3C/svg%3E';


export const BulletListIcon = ({ size = 20, className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="4" cy="6" r="2" fill="currentColor" stroke="none" />
    <circle cx="4" cy="12" r="2" fill="currentColor" stroke="none" />
    <circle cx="4" cy="18" r="2" fill="currentColor" stroke="none" />
    <line x1="9" y1="6" x2="20" y2="6" />
    <line x1="9" y1="12" x2="20" y2="12" />
    <line x1="9" y1="18" x2="20" y2="18" />
  </svg>
);

export const ColumnListIcon = ({ size = 20, className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export const RowListIcon = ({ size = 20, className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="3" width="8" height="8" rx="1" strokeWidth="1.5" />
    <rect x="14" y="3" width="8" height="8" rx="1" strokeWidth="1.5" />
    <rect x="2" y="13" width="8" height="8" rx="1" strokeWidth="1.5" />
    <rect x="14" y="13" width="8" height="8" rx="1" strokeWidth="1.5" />
  </svg>
);

export const DeleteIcon = ({className}:{className:"ltr" | "rtl" | undefined}) => (
<svg
  className={className || ''}
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
</svg>)

export const positionClasses = {
    'top-right': 'dir-toggle-top-right',
    'top-left': 'dir-toggle-top-left',
    'bottom-right': 'dir-toggle-bottom-right',
    'bottom-left': 'dir-toggle-bottom-left'
  };
