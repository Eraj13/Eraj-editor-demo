'use client';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { useCallback, useEffect } from 'react';
import { blurUpdate } from '@/app/modules/components/editor/utils/utils';
import './MyText.css';
import useControllableEditorNodes from '../hooks/useControllableEditorNodes';
import { ActiveMarks, EditorNodeTag, MyTextEditorProps, toolbarState_Prop } from '../core/types';
import { ContentNode } from '../ContentNode';
import { FormatToolbar } from './FormatToolbar';
import { LinkInput } from './LinkInput';
import applyFormatToLeaves from '../utils/applyFormatToLeaves';
import { parseInlineHtmlToTextLeaves } from '../utils/Convert';
import { captureSelection, getNodeElementById, getOffsetWithin, restoreSelection } from '../utils/dom';
import DirectionToggle from '../lnToggle/DirectionToggle';
import { ListContainer } from './ListContainer';
import { FabContainer } from '../FabContainer';

export const MyTextEditor = (props: MyTextEditorProps) => {
  const {onNotification} = props;

  const { state, apply } = useControllableEditorNodes(
    props.value,
    props.defaultValue,
    props.onChange,
    props.meta_test
  );
  const [toolbarState, setToolbarState] = useState<toolbarState_Prop>({
    show: false,
    showLinkInput: false,
    position: { top: 0, left: 0 },
    context: null
  });
  // Store selection range when link button is clicked
  const [savedSelection, setSavedSelection] = useState<Range | null>(null);
  const activeNodeIdRef = useRef<string | null>(null);
  const activeNodeElRef = useRef<HTMLElement | null>(null);
  const selectionRef = useRef<{
    nodeId: string;
    offset: number;
  } | null>(null);
  const [typeDirection, settypeDirection] = useState<'ltr' | 'rtl'>('ltr');
  const [isOpen, setIsOpen] = useState(false);
  // Track focus history as a stack
  const focusHistoryRef = useRef<string[]>([]);
  const previousLengthRef = useRef(state.editorNodes.length);
  const processedRef = useRef<Set<string>>(new Set());

  const notificationRef = useRef(onNotification);

useEffect(() => {
  notificationRef.current = onNotification; // Always updates
}, [onNotification]);

  useLayoutEffect(() => {
    const sel = selectionRef.current;
    if (!sel) return;
    const el = getNodeElementById(sel.nodeId);
    if (!el) return;

    restoreSelection(el, sel.offset);
  }, [state]);

  const handleSectionFocus = useCallback((rect: HTMLElement, nodeId: string,) => {
    // Remove if already in history (to avoid duplicates)
    const index = focusHistoryRef.current.indexOf(nodeId);
    if (index !== -1) {
      focusHistoryRef.current.splice(index, 1);
    }
    
    // Add to top of stack (most recent last)
    focusHistoryRef.current.push(nodeId);
    
    // Keep history limited to last 50 (performance)
    if (focusHistoryRef.current.length > 50) {
      focusHistoryRef.current.shift();
    }
  
    activeNodeIdRef.current = nodeId;
    activeNodeElRef.current = rect;
  }, []);

  // Auto-focus first section on mount
  useEffect(() => {
    const firstEditable = document.querySelector('[data_node_id]');
    if (firstEditable) {
      (firstEditable as HTMLElement).focus();
    }
  }, []);

  const editorRef = useRef<HTMLDivElement>(null);
  // Centralized selection handler
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      // Hide toolbar if selection is collapsed (just cursor) or outside editor
      if (!selection || selection.isCollapsed || 
          (editorRef.current && !editorRef.current.contains(selection.anchorNode))) {
        setToolbarState(prev => ({ ...prev, show: false }));
        return;
      }
      const range = selection.getRangeAt(0);
      // First check if startContainer itself has data_node_id
      let nodeElement = range.startContainer.nodeType === Node.ELEMENT_NODE 
      ? range.startContainer as Element
      : range.startContainer.parentElement;

    // Then try to find the closest element with data_node_id
    if(nodeElement) nodeElement = nodeElement?.closest('[data_node_id]');
    if (nodeElement) {
        const nodeId = nodeElement.getAttribute('data_node_id');
        
        if (nodeId ) {
          const rect = range.getBoundingClientRect();
          setToolbarState({
            show: true,
            showLinkInput: false,
            position: {
              top: rect.top + window.scrollY - 50,
              left: rect.left + window.scrollX -55
            },
            context: { nodeId }
          });
        }
      }
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  const handleLinkCreate = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      setSavedSelection(selection.getRangeAt(0).cloneRange());
    }
    setToolbarState(prev => ({
      ...prev,
      showLinkInput: true,
      show: false
    }));
   };

  const handleFormat = (mark: keyof ActiveMarks) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    const el = activeNodeElRef.current;
    const nodeId = activeNodeIdRef.current;
    if (!nodeId || !el) return;
    const start = getOffsetWithin(
      el,
      range.startContainer,
      range.startOffset
    );

    const end = getOffsetWithin(
      el,
      range.endContainer,
      range.endOffset
    );

    // const start = Math.min(range.startOffset, range.endOffset);
    // const end = Math.max(range.startOffset, range.endOffset);
    // 🔑 DOM → model
    const richContent = parseInlineHtmlToTextLeaves(el.innerHTML);
    selectionRef.current = captureSelection(el, nodeId);

    // 🔑 model → model
    const nextChildren = applyFormatToLeaves(
      richContent,
      start,
      end,
      mark
    );
    // 🔑 single state update
    apply({
    type: 'UPDATE_CONTENT',
    nodeId,
    children: nextChildren
    });
    sel.removeAllRanges();
    const collapsed = document.createRange();
    collapsed.setStartAfter(range.endContainer);
    collapsed.collapse(true);
    sel.addRange(collapsed);
  };

  const handleLinkSubmit = (url: string) => {
    // 1. Type-safe null check for context
    if (!toolbarState.context) {
      return;
    };
    
    const sanitizedUrl = url.startsWith('http') ? url : `https://${url}`;
  
    // 1. Get the current selection
    // Restore the saved selection
    const selection = window.getSelection();
    if (selection && savedSelection) {
      selection.removeAllRanges();
      selection.addRange(savedSelection);
    }
    try {
      // Create and apply link to the restored selection
      const link = document.createElement('a');
      link.href = sanitizedUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      
      savedSelection?.surroundContents(link);
      const nodeElement = document.querySelector(`[data_node_id="${toolbarState.context.nodeId}"]`);
      if(nodeElement)
      savedSelection?.collapse();

      // Clean up
      setToolbarState(prev => ({
        ...prev,
        showLinkInput: false,
        show: false
      }));
      setSavedSelection(null);
      
    } catch (error) {
      console.error('Error creating link:', error);
    }
  };


  
  // Focus on newest added node. 
  useEffect(() => {
    if (state.editorNodes.length === 0) return;
    
    let newestId: string | null = null;
    let newestTime = 0;
    
    for (const [id, meta] of Object.entries(state.nodeMetadata)) {
      if (meta.createdAt > newestTime && !processedRef.current.has(id)) {
        newestTime = meta.createdAt;
        newestId = id;
      }
    }
    
    if (newestId) {
      processedRef.current.add(newestId);
      requestAnimationFrame(() => {
      const element = document.querySelector(`[data_node_id="${newestId}"]`) as HTMLElement;
      if (element) {
        element.focus();       
      }
    });
    }
  }, [state.editorNodes.length, state.nodeMetadata]);

// Handle deletion focus restoration
  useEffect(() => {
    const currentLength = state.editorNodes.length;
    const previousLength = previousLengthRef.current;
    
    // Node was deleted
    if (currentLength < previousLength) {

      // Get the last focused node BEFORE deletion
      focusHistoryRef.current.pop();
      
      // Find the next valid node to focus
      let nextFocusId: string | null = null;
      
      // Try to focus the previous node in history
      if (focusHistoryRef.current.length > 0) {
        nextFocusId = focusHistoryRef.current[focusHistoryRef.current.length - 1];
      }
      
      // If no history, try to focus any remaining node
      if (!nextFocusId && state.editorNodes.length > 0) {
        // nextFocusId = state.editorNodes[0]?.id || null;
      }  
      // Focus the next node if found
      const range = document.createRange();
      const selection = window.getSelection();
      const element = document.querySelector(`[data_node_id="${nextFocusId}"]`)
      requestAnimationFrame(() => {
        if(element !== null) range.selectNodeContents(document.querySelector(`[data_node_id="${nextFocusId}"]`) as HTMLElement);
        range.collapse(false);
      }) 
      selection?.removeAllRanges();
      selection?.addRange(range);                  
      requestAnimationFrame(() => {
        if (element) {
          (element as HTMLElement).focus();
        }
      });
    }
    
    previousLengthRef.current = currentLength;
  }, [state.editorNodes.length, state.editorNodes]);

  // FIRST LOAD UP
  useEffect(() => {
    const firstNode = state?.editorNodes?.[0];
    const element = document.querySelector(`[data_node_id="${firstNode?.id}"]`);
    if(state.editorNodes.length < 2 && firstNode?.tag === "h1" && firstNode?.children.length === 0 && element) {
    (element as HTMLElement).focus();
    }
    return () => {
      
    };
  }, [state.editorNodes]);
  
  //  Deleting. 
   const DeleteNode = useCallback((nodeId: string, nodeParentId?: string, tagType?: EditorNodeTag, mediaId?: string) => {
     if(state.editorNodes.length <= 1){
        notificationRef.current?.({show: true, message: "Can not delete the only node"});
      return;
      }
      apply({
        type: 'DELETE_NODE',
        tagType:  tagType,       
        nodeId: nodeId,
        parentId: nodeParentId,
        mediaId: mediaId
      });
    },[state.editorNodes.length ,apply]);


    const [direction, setDirection] = useState<'ltr' | 'rtl'>(state.preferences.languageDirection);
      const [isAnimating, setIsAnimating] = useState(false);
     const handleDirectionToggle = () => {
    const newDirection = direction === 'ltr' ? 'rtl' : 'ltr';
    settypeDirection(newDirection);
    apply({
      type: "CHANGE_LANGUAGE",
      direction: newDirection
    })
    const firstNode = state?.editorNodes?.[0];
    const element = document.querySelector(`[data_node_id="${firstNode?.id}"]`);
    
    (element as HTMLElement).focus();
     if (isAnimating) return;
        setIsAnimating(true);
        
        // Trigger animation
        setTimeout(() => {
          setDirection(newDirection);
          // onToggle?.();
        }, 150);
        
        // Reset animation state
        setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <>
    {/* <FocusProvider> */}
    <div className={`container_ ${props.isModalOpen ? "editor-overlay": ""}`} inert={props.isModalOpen ? true : false} key={props.mode}>
      {props.meta_test &&
      <h1 className='container_h1'>CONFIRM THE META DATA</h1>}
      {!props.meta_test &&
       <DirectionToggle 
        initialDirection={typeDirection}
        onToggle={handleDirectionToggle}
        position="top-right"
        onAnimation={isAnimating}
        onDirection={direction}
      />}
      <div className="nodes-container" ref={editorRef}>
        {state.editorNodes.map((node,i) => {
          // Skip rendering list items here - they'll be rendered by their parent list
          
          if (node.parentId) return null;
          
          // If this is a list container, render ListContainer with its children
          if (node.tag === 'ul' || node.tag === 'ol') {
            const listItems = state.editorNodes.filter(
              n => n.parentId === node.id && n.tag === 'li'
            );
            
            return (
              <ListContainer
                key={node.id}
                listNode={node}
                items={listItems}
                onapply={apply}
                onFocus={handleSectionFocus}
                onBlur={(id, content) => 
                  blurUpdate({id, content, tag: 'li'}, apply)
                }
                onPreferences={state.preferences}
                onMeta_test={props.meta_test}
                onNotficationList={onNotification}
                onDelete={DeleteNode}
              />
            );
          }
          
          // Regular nodes render as before
        else return <ContentNode
            key={i}
            node={node}
            onapply={apply}
            onBlur={(id,content) => {
              blurUpdate({id, content, tag: node.tag}, apply) 
            }          
            }
            onFocus={handleSectionFocus}
            onPreferences={state.preferences}
            onMeta_test={props.meta_test}
            onNotfication={onNotification}
            onDelete={DeleteNode}
          />
        })}
      </div>
      {state.editorNodes.length < 1 &&
       <div className="urgent-fab"> 
        <FabContainer 
          mode={"DEFAULT"}
          onisOpen={isOpen} 
          onsetIsOpen={setIsOpen} 
          onapply={apply}
          onActiveNode={null} onNodeId={undefined} 
          newnode={true}
        />
      </div>
      }
      {!props.meta_test && toolbarState.show && (
        <FormatToolbar
          position={toolbarState.position}
          onFormat={(mark) => handleFormat(mark)}
          onLinkCreate={() => handleLinkCreate()
          }
        />
      )}
      {!props.meta_test && toolbarState.showLinkInput && (
        <LinkInput
          position={toolbarState.position}
          onSubmit={handleLinkSubmit}
          onCancel={() => setToolbarState(prev => ({ ...prev, show: false ,showLinkInput: false}))}
        />
      )}
          {/* // Notification at bottom */}
    {/* <SaveNotification 
      visible={showSaveNotification}
      onHide={() => setShowSaveNotification(false)}
    /> */}
    </div>
    </>
  );
};

// export default MyTextEditor;