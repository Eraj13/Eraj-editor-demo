/* eslint-disable @next/next/no-img-element */
'use client';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { ContentNodeProps, EditorNode, MediaItem, TextLeaf } from '../core/types';
import { parseInlineHtmlToTextLeaves } from '../utils/Convert';
import { FabContainer } from '../FabContainer';
import './styles.css';
import { blurUpdate, slugifyFilename } from '../utils/utils';
import { getImageFromIndexedDB } from '../utils/indexDB';
import { PLACEHOLDER_IMAGE } from '../utils/constants';
import { DeleteButton } from '../react/DeleteButton';


const ZWSP = '\u200B';
function renderChildren(children: TextLeaf[]) {
  return children.map((leaf, i) => {
    const isEmpty = leaf.text === '';
    let content: React.ReactNode = isEmpty ? ZWSP : leaf.text;
    // let content: React.ReactNode = leaf.text;
    if (leaf.bold) content = <strong>{content}</strong>;
    if (leaf.italic) content = <em>{content}</em>;
    if (leaf.underline) content = <u>{content}</u>;
    if (leaf.link?.href) content = <a href={leaf.link.href}>{content}</a>;
    return <React.Fragment key={i}>{content}</React.Fragment>;
  });
}

export const ContentNode = React.memo(function ContentNode({
  node,
  onFocus,
  onBlur,
  onapply,
  onPreferences,
  onMeta_test,
  onNotfication,
  onDelete
}: ContentNodeProps) {
  const nodeRef = React.useRef<HTMLDivElement | HTMLQuoteElement | HTMLElement>(null);
  const [activeNode, setActiveNode] = useState<string| null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  const [loadingImg, setLoadingImg] = useState(true);
  const handleChildFocus = () => {
    if (!nodeRef.current) return;
    // const rect = nodeRef.current.getBoundingClientRect();
    const rect = nodeRef.current;
    setActiveNode(node.id);
    onFocus(rect, node.id);
    setIsOpen(false);
  };

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    const next = e.relatedTarget as HTMLElement | null;
    const Format_div = document.getElementById("FormatToolbar");
    const LinkL_div = document.getElementById("LinkInput");

    // 👇 If focus moves inside the same node-wrapper, ignore blur
    if (next && e.currentTarget.contains(next) || Format_div || LinkL_div) {
      return;
    }
    setIsOpen(false);
    setActiveNode(null);
    if (!nodeRef.current) return;
    const related = e.relatedTarget as HTMLElement | null;
    // Skip update if user clicked on toolbar or link input
    if (related?.closest('.format-toolbar') || related?.closest('.link-input')) {
      return;
    }
    const richContent = parseInlineHtmlToTextLeaves(nodeRef.current.innerHTML);
    if(richContent.length < 0) return;
    onBlur(node.id, richContent);
  };
  
  let output: ReactNode;
  const baseEditableProps = {
    contentEditable: true,
    suppressContentEditableWarning: true,
    tabIndex: -1,
    'data-placeholder':  node.placeHolder,
    className: `content-node ${node.tag}`,
    data_node_id: node.id,
    style: {padding: (node.tag ==="p" && onMeta_test) ? "0 5px" : "0"}
  };
   
  const handleImageClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();

      reader.onload = async (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result.toString();
          const mediaItem: MediaItem = {
              filename: slugifyFilename(file.name),
              uploaded: false,
              type: file.type,
              size: file.size
            };  
          const newNode: EditorNode = {
            id: node.id,
            tag: 'image',
            children: [],
            imageMeta: {
              mediaId: node.imageMeta?.mediaId,
              src: dataUrl,
              mediaItem         
            }
          };
          
          onapply({
            type: 'UPDATE_IMAGE_SRC',
            node: newNode
          });
          
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };
  
  // Delete with backspace button.
   const DeleteBackspace = useCallback((e: Event) => {
    if (!(e instanceof KeyboardEvent)) return;

    if(e.key === "Backspace") {
      const targrt = nodeRef.current
      if(targrt && targrt?.textContent.length < 1){
        onDelete(node.id, node.parentId);
      }
// e: React.FocusEvent<HTMLElement>
    }
  }, [node.id, node.parentId,onDelete])

  useEffect(() => {
    const el = nodeRef.current
    el?.addEventListener("keydown", (DeleteBackspace));

    return () => {
    el?.removeEventListener("keydown", (DeleteBackspace));
      
    };
  }, [DeleteBackspace, activeNode]);

  // ✅ Correct - Ctrl+S (Windows/Linux) or Cmd+S (Mac)
  useEffect(() => {
    const handleKeyDown = (e: Event) => {
      if (!(e instanceof KeyboardEvent)) return;
      // Check for Ctrl (Windows/Linux) OR Meta (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault(); // Prevent browser's save dialog           
        if (!nodeRef.current) return;
        onNotfication?.({show: true, message: "saved"});
        const richContent = parseInlineHtmlToTextLeaves(nodeRef.current.innerHTML);
        blurUpdate({id: node.id, content: richContent, tag: node.tag}, onapply) 
      }
    };

    if(onMeta_test) return;
    const el = nodeRef.current;
    el?.addEventListener("keydown", handleKeyDown);
    return () => el?.addEventListener("keydown", ()=> handleKeyDown);

  }, [onapply, node.tag, node.id, onNotfication, onMeta_test]);

  // Auto-save every 30 seconds while typing
  useEffect(() => {
    if(onMeta_test) return;

    const intervalId = setInterval(() => {
      if (!nodeRef.current) return;
      // onShowSaveNotfication(true);
      const richContent = parseInlineHtmlToTextLeaves(nodeRef.current.innerHTML);
      blurUpdate({id: node.id, content: richContent, tag: node.tag}, onapply) 
      // localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      // Optional: show subtle "Auto-saved" indicator
    }, 	60000); // Save every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [onapply, node.tag, node.id, onMeta_test]);          


  // SAVE BEFORE UNLOAD
  useEffect(() => {

    if(onMeta_test) return;

    const saveDraft = () => {
      // console.log()
    if (!nodeRef.current) return;
      // onShowSaveNotfication(true);
      const richContent = parseInlineHtmlToTextLeaves(nodeRef.current.innerHTML);
      blurUpdate({id: node.id, content: richContent, tag: node.tag}, onapply) 
    };
  
    // ADD listener when component mounts
    window.addEventListener('beforeunload', saveDraft);
    
    // REMOVE listener when component unmounts
    return () => window.removeEventListener('beforeunload', saveDraft);
  }, [onapply, node.tag, node.id, onMeta_test]);
  
  useEffect(() => {
  if(node.imageMeta?.isUrl && node.imageMeta?.src) setImageSrc(node.imageMeta?.src)
  else if (node.tag === "image" && node.imageMeta?.mediaId && node.imageMeta?.mediaItem?.filename) {
    setLoadingImg(true);
    getImageFromIndexedDB(node.imageMeta.mediaId).then((image) => {
      if (image) {
        setImageSrc(`${image.base64}`);
      }
    });
    setLoadingImg(false);
  }
  }, [node.tag, node.imageMeta?.mediaId, node.imageMeta?.mediaItem?.filename, node.imageMeta?.isUrl,node.imageMeta?.src]);
      
// Also save on beforeunload (as shown above) 
  switch (node.tag) {
    case 'p':
      output = <p ref={nodeRef as React.RefObject<HTMLParagraphElement>} 
       key={node.id + JSON.stringify(node.children)}
      {...baseEditableProps}
      >
       {renderChildren(node.children)}
      </p>;
      break;
    case 'h1':
      output = <h1 ref={nodeRef as React.RefObject<HTMLHeadingElement>} {...baseEditableProps}
       key={node.id + JSON.stringify(node.children)}
      >
        {renderChildren(node.children)}
        </h1>;
      break;
    case 'h2':
      output = <h2 ref={nodeRef as React.RefObject<HTMLHeadingElement>} {...baseEditableProps}
       key={node.id + JSON.stringify(node.children)}
      >
        {renderChildren(node.children)}
        </h2>;
      break;
    case 'blockquote':
      output = (
        <blockquote ref={nodeRef as React.RefObject<HTMLQuoteElement>} {...baseEditableProps} 
       key={node.id + JSON.stringify(node.children)}
        >
          {renderChildren(node.children)}
        </blockquote>
      );
      break;
    case 'image':
       // ✅ Show loading state
    if (loadingImg) {
      output = (
        <figure className="image-container loading">
          <div className="image-placeholder-loading">
            <div className="spinner"></div>
            <span>Loading image...</span>
          </div>
          <figcaption className="image-caption">
            {node.imageMeta?.mediaItem?.filename || 'Uploading...'}
          </figcaption>
        </figure>
      );
    }
    
      // ✅ Show error state
      // if (error) {
      //   return (
      //     <figure className="image-container error">
      //       <div className="image-placeholder-error">
      //         <span>❌</span>
      //         <span>Failed to load image</span>
      //       </div>
      //     </figure>
      //   );
      // }
    
      output = (
        <figure className={`image-container ${onMeta_test ? "onMeta_test" : ''}` } tabIndex={0}
        >
         <div className="image-overlay"
          onClick={handleImageClick}>
        🖼️ Change</div>
          <img src={imageSrc || PLACEHOLDER_IMAGE} alt={node.imageMeta?.alt || "Picture"} 
           className='image'
          >
          </img>
          {!onMeta_test && 
          <figcaption
          ref={nodeRef as React.RefObject<HTMLImageElement>}
          {...baseEditableProps} 
          className="image-caption"
          style={{direction: onPreferences?.languageDirection}}
          >
          {/* {renderChildren(node.imageMeta.alt)} figcap automatickly reads text inside it from the page*/}
          </figcaption>}
      </figure>
      );
      break;
    case "li": {
      output = 
      <>
      <span className="list-marker">
            {/* List marker (bullet/number) */}
              {/* {listNode.tag === 'ol' ? `${index + 1}.` : '•'} */}
              •
      </span> 
      <p ref={nodeRef as React.RefObject<HTMLParagraphElement>} 
       key={node.id + JSON.stringify(node.children)}
       {...baseEditableProps}
       >
       {renderChildren(node.children)}
      </p>
        </>
    }  
    break;
    default:
      <br></br>     
  }
  return (  
    <div onBlur={(e) => handleBlur(e)}  className={`node-block ${onPreferences?.languageDirection}`}
      style={{direction:  onPreferences?.languageDirection}}>
      {!onMeta_test && 
      <FabContainer 
        mode={"NORMAL"}
        onisOpen={isOpen} onsetIsOpen={setIsOpen} 
        onapply={onapply}
        onActiveNode={activeNode} onNodeId={node.id} 
        lnd={onPreferences?.languageDirection}
      />}
      <div
        className={`node-wrapper ${node.tag === 'li' ? "_li" : ""} ${node.tag === "image" ? "image" : ""}`}
        onFocus={handleChildFocus}>
        {output}
      </div>
       {(!onMeta_test && node.tag !== "li" ) &&
        <DeleteButton 
        nodeTag={node.tag}
        visibility={activeNode === node.id} 
        lngD={onPreferences?.languageDirection}
        onClick={()=> onDelete(node.id, node.parentId, node.tag, node.imageMeta?.mediaId)}
        />
       }
    </div>
  );
});
