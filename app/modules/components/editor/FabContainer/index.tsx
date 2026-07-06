'use client';
import React, { useMemo, useRef,  } from 'react';
import './styles.css';
import { fabContainerProps, EditorNodeTag, MediaItem  } from '../core/types';
import { addNode,  slugifyFilename } from '../utils/utils';
import { BulletListIcon, ColumnListIcon, RowListIcon } from '../utils/constants';

export const FabContainer = ({mode ,onisOpen, onsetIsOpen, onapply,onActiveNode, onNodeId, newnode, lnd}: fabContainerProps) => {
  
  const fabRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ useMemo — computes value during render, no extra re-render
const visibilities = useMemo(() => {
  if (onNodeId === onActiveNode && !newnode) return "visible";
  if (newnode) return "visible";
  return "hidden";
}, [newnode, onNodeId, onActiveNode]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target?.result) {
      const dataUrl = event.target.result.toString();
       // Create MediaItem
      const mediaItem: MediaItem = {
        // base64: dataUrl.split(',')[1], 
        filename: file.name,
        uploaded: false,
        type: file.type,
        size: file.size
      };  
      
      const imageMeta = {
        src: dataUrl,
        filename: slugifyFilename(file.name),        
        mediaItem, // 🆕 Pass separately
      }
      addNode("image", onapply, onNodeId, undefined, imageMeta,)
      }
    };
    reader.readAsDataURL(file);
    onsetIsOpen(false);
    // setVisibilitys("hidden");
  };
  
  const addNewNode = function (type: EditorNodeTag, listDirection?: "column" | "row" ) {
    // onAdd(type, listDirection);
    addNode(type, onapply, onNodeId, listDirection);
    // setVisibilitys("hidden");
    onsetIsOpen(false);  
    
  }
  
  return (
    <div 
      className="fab-wrapper"
      style={{
        visibility: visibilities,              
        zIndex: 100
      }}
      ref={fabRef}
    >
      <div className={`fab-container ${onisOpen ? 'active' : ''}`}>
        <button 
          className="fab-main"
          onClick={() => onsetIsOpen(!onisOpen)}
          aria-label="Add media"
          tabIndex={0}
        >
          +
        </button>   
        <div className="fab-options">
          <div className='list-add-wrapper'>
            <button 
              className="fab-option" 
              aria-label="Add H1"
              onClick={() => addNewNode("h1")}
            >
              H1
            </button>
            <button 
              className={`sub-button ${lnd === "rtl" && "rtl"}`}
              aria-label="Add H2"
              onClick={() => addNewNode("h2")}
              >
                H2
            </button>        
          </div>
          <div className='list-add-wrapper'>
            <button 
              className="fab-option"
              onClick={handleImageClick}  // Now correctly typed
              aria-label="Add image"
            >
              🖼️
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </button>
            <button 
              className={`sub-button ${lnd === "rtl" && "rtl"}`}
              aria-label="Add video"
              disabled // Currently not implemented
            >
              🎥
            </button>
          </div>
        <div className="list-add-wrapper">
          <button 
            className="fab-option" 
            aria-label="Add paragrpah"
            onClick={() => addNewNode("p")}
          >
            P
          </button>
          <button 
            className={`sub-button ${lnd === "rtl" && "rtl"}`} 
            aria-label="Add paragrpah"
            onClick={() => addNewNode("blockquote")}
          >
            Q
          </button>
          </div>
          <div className='list-add-wrapper'>
          <button 
            className="fab-option fab-option_ul" 
            aria-label="Add unordered list"
          >
            {BulletListIcon({size:20})}
          </button>
          <button 
            className={`sub-button ${lnd === "rtl" && "rtl"}`}            
              onClick={() => addNewNode("ul",'row')}
              aria-label="Add list item"
            >
              <span className="plus-icon">{RowListIcon({size:20})}</span>
          </button>
          <button 
            className={`sub-button ${lnd === "rtl" && "rtl"}`}            
              onClick={() => addNewNode("ul",'column')}
              aria-label="Add list item"
            >
              <span className="plus-icon">{ColumnListIcon({size:20})}</span>
          </button>
          </div>
        </div>
      </div>
    </div>
  );
};

FabContainer.displayName = 'FabContainer';
// Helper function
