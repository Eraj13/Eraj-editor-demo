import { EditorNode, EditorState, NodeAction, } from "../core/types";
import applyFormatToLeaves from "../utils/applyFormatToLeaves";
import { deleteImageFromIndexedDB, updateImageInIndexedDB } from "../utils/indexDB";
import { generateId, placeHolder_re, saveToLocal } from "../utils/utils";

export function editorNodeReducer(
  state: EditorState,
  action: NodeAction
): EditorState {
  switch (action.type) {

    case 'ADD_NODE': {
    
    // ✅ Save to IndexedDB (not localStorage)
      const newNode:EditorNode  = {     
        tag: action.tagType,
        id: generateId(),
        children: [],
        placeHolder: placeHolder_re(action.tagType, state.preferences.languageDirection),
        imageMeta: action.imageMeta,
      };

      const nodeIndex = state.editorNodes.findIndex(node => node.id === action.nodeId);

      const newState = {...state, editorNodes: state.editorNodes.toSpliced(nodeIndex + 1, 0, newNode),
        nodeMetadata: {
        ...state.nodeMetadata,
        [newNode.id]: { createdAt: Date.now()}
       },
      };
      
      saveToLocal(newState);
      return newState;
    }

    case "DELETE_NODE": {
      if(action.parentId) {
        const childrenOfParent = state.editorNodes.filter(node => node.parentId === action.parentId);

        if(childrenOfParent.length <= 1) { 
          return {
            ...state, editorNodes: state.editorNodes.filter(node => (node.id !== action.parentId)).filter(node => (node.id !== action.nodeId)
          )}
        }
      };
     
      const newNodeMetadata = new Map(Object.entries(state.nodeMetadata));

      if(newNodeMetadata.has(action.nodeId)) newNodeMetadata.delete(action.nodeId);
      if(action.mediaId) deleteImageFromIndexedDB(action.mediaId); 
      const newState = {
        ...state, editorNodes: state.editorNodes.filter(node => node.id !== action.nodeId),
        nodeMetadata: newNodeMetadata,
      } 
      saveToLocal(newState);
      return newState;
    }

    case "CHANGE_LANGUAGE": {
      const newState = {...state, preferences: {...state.preferences, languageDirection: action.direction}}
      saveToLocal(newState);
      return newState;
    }

    case 'UPDATE_CONTENT': {
      // immutability is crucial, retunring a new object
      const newNode = state.editorNodes.map(node => {
        if( node.tag !== 'image' && node.id === action.nodeId){
           return {
          ...node,
          children: action.children
        };
        } else
        return node;
      });
      
      const newState = {...state, editorNodes: newNode}
      saveToLocal(newState);
      return newState;
    }

    case "UPDATE_LIST" : {
      const newNode = state.editorNodes.map(node => {
        if(node.id === action.nodeId){
           return {
          ...node,
          list: action.list
        };
        } else
        return node;
      });
      return {...state, editorNodes: newNode}
    }

    case 'UPDATE_IMAGE_SRC':{
      const newImageMeta = action.node.imageMeta;
      updateImageInIndexedDB(newImageMeta?.mediaId, newImageMeta?.src, newImageMeta?.mediaItem?.filename);
      const newNode = state.editorNodes.map((node) =>
        node.id === action.node.id && node.tag === 'image' && action.node.imageMeta
          ? {
              ...node,
              imageMeta: {
                ...node.imageMeta,
                src: '',
                filename: newImageMeta?.mediaItem?.filename,
                mediaItem: newImageMeta?.mediaItem
              }
            }
          : node
      );
      return {...state, editorNodes:newNode}
    }

    case "UPDATE_IMAGE_ALT":{
      const newNode = state.editorNodes.map((node) =>
        node.id === action.nodeId && node.tag === 'image' && node.imageMeta
          ? {
              ...node,
              imageMeta: {
                ...node.imageMeta,
                alt: action?.alt[0]?.text,
                src: node.imageMeta.src
              }
            }
          : node
      );
      return {...state, editorNodes: newNode}
    }

    case 'FORMAT_SELECTION': {
      const newNode = state.editorNodes.map(node => {
        if (node.id !== action.nodeId || !node.children) return node;
        return {
          ...node,
          children: applyFormatToLeaves(
            node.children,
            Math.min(action.anchor, action.focus),
            Math.max(action.anchor, action.focus),
            action.format
          )
        };
      });
      return {...state, editorNodes: newNode}
    }
    
    case 'ADD_LIST': {
      const listId = `list-${Date.now()}-${Math.random().toString(36)}`;
      const firstItemId = `li-${Date.now()}-${Math.random().toString(36)}`;      
      const listNode: EditorNode = {
        id: listId,
        tag: action.listType, 
        children: [],
        placeHolder: 'List',
        listDirection: action.listDirection
      };
      
      const firstItem: EditorNode = {
        id: firstItemId,
        tag: "li",
        children: [],
        parentId: listId,
        order: 0,
        placeHolder: placeHolder_re("li",state.preferences.languageDirection)
      };
      const nodeIndex = state.editorNodes.findIndex(node => node.id === action.nodeId);

      const newState = {...state, editorNodes: state.editorNodes.toSpliced(nodeIndex + 1, 0, listNode, firstItem),
        nodeMetadata: {
        ...state.nodeMetadata,
        [listNode.id]: { createdAt: Date.now()},
        [firstItem.id]: { createdAt: Date.now()}
       },
      };
      saveToLocal(newState);
      return newState;
    }

    case 'ADD_LIST_ITEM': {
      const { listId, afterItemId } = action;
      
      const listItems = state.editorNodes
        .filter(n => n.parentId === listId)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      
      const insertIndex = afterItemId 
        ? listItems.findIndex(item => item.id === afterItemId) + 1
        : listItems.length;
      
      const newItem: EditorNode = {
        id: `li-${Date.now()}-${Math.random().toString(36)}`,
        tag: 'li',
        children: [],
        parentId: listId,
        order: insertIndex,
        placeHolder: placeHolder_re("li", state.preferences.languageDirection)
      };
      
      const updatedItems = [
        ...listItems.slice(0, insertIndex),
        newItem,
        ...listItems.slice(insertIndex)
      ].map((item, idx) => ({ ...item, order: idx }));
      
      const otherNodes = state.editorNodes.filter(n => n.parentId !== listId);
      const newState = {
        ...state,
        editorNodes: [...otherNodes, ...updatedItems]
      };
      saveToLocal(newState);
      return newState;
    }

    case 'UPDATE_LIST_ITEM': {
      const { itemId, content } = action;
      
      return {
        ...state,
        editorNodes: state.editorNodes.map(node =>
          node.id === itemId
            ? { ...node, children: content }
            : node
        )
      };
    }
    break
    default:
       return state
  }
}