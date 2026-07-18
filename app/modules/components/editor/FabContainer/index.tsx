'use client';
import React, { useMemo, useRef, useState,  } from 'react';
import './styles.css';
import { fabContainerProps, EditorNodeTag, MediaItem  } from '../core/types';
import { addNode,  getImageDimensions, slugifyFilename } from '../utils/utils';
import { BulletListIcon, ColumnListIcon, RowListIcon } from '../utils/constants';
import { ImageUrlInput } from '../react/ImageUrlInput';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const FabContainer = ({mode ,onisOpen, onsetIsOpen, onapply,onActiveNode, onNodeId, newnode, lnd}: fabContainerProps) => {
  
  const fabRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  // ✅ useMemo — computes value during render, no extra re-render
  const visibilities = useMemo(() => {
    if (onNodeId === onActiveNode && !newnode) return "visible";
    if (newnode) return "visible";
    return "hidden";
  }, [newnode, onNodeId, onActiveNode]);
  const isAddingRef = useRef(false);
  

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dimensions = await getImageDimensions(file);

    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target?.result) {
      const dataUrl = event.target.result.toString();
      const mediaItem: MediaItem = {
        filename: file.name,
        uploaded: false,
        type: file.type,
        size: file.size,
        height: dimensions.height,
        width: dimensions.width
      };  
      
      const imageMeta = {
        src: dataUrl,
        isUrl: false,
        filename: slugifyFilename(file.name),        
        mediaItem,
      }

      addNode("image", onapply, onNodeId, undefined, imageMeta,)
      }
    };
    reader.readAsDataURL(file);
    onsetIsOpen(false);
  };
  
   const handleUrlInsert = async (url: string, filename: string) => {
    // ✅ Create image node from URL (not Base64!)
    const mediaItem: MediaItem = {
        filename: filename,
      };  
      
      const imageMeta = {
        src: url,
        isUrl: true,
        filename: slugifyFilename(filename),        
        mediaItem, 
      }
      addNode("image", onapply, onNodeId, undefined, imageMeta,)
      onsetIsOpen(false); 
    // const dimensions = await getImageDimensions(file);
      // increaseHeight("image",dimensions);

  };

  const addNewNode = function (type: EditorNodeTag, listDirection?: "column" | "row" ) {
    if(isAddingRef.current) return;
    isAddingRef.current = true; 
    addNode(type, onapply, onNodeId, listDirection);
    onsetIsOpen(false);  
    // increaseHeight("p"); 
    setTimeout(() => {
        isAddingRef.current = false;
      }, 300); 
  }
  
  function closeAll() {
    setShowUrlInput(false);
    onsetIsOpen(false);  
  }


  return (
    <>
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
              onClick={() => setShowUrlInput(true)}
            >
              🔗
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
    <ImageUrlInput isOpen={showUrlInput}
      onClose={() => closeAll()} 
      onInsert={handleUrlInsert}
    />
    </>
  );
};

FabContainer.displayName = 'FabContainer';
// Helper function
