// components/ListContainer.tsx
import React from 'react';
import { ListContainerProps } from '../core/types';
import './ListContainer.css';
import { ContentNode } from '../ContentNode';
import { DeleteButton } from './DeleteButton';




export const ListContainer: React.FC<ListContainerProps> = ({
  listNode,
  items,
  onapply,
  onFocus,
  onBlur,
  onPreferences,
  onMeta_test,
  onNotficationList,
  onDelete
}) => {
  // Sort items by order
  const sortedItems = [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
  
  const addListItem = (afterId?: string) => {
    onapply({
      type: 'ADD_LIST_ITEM',
      listId: listNode.id,
      // I ADDED || "" FOR REMOVING TYPE ERROR
      afterItemId: afterId || ''
    });
  };
  
  return (
    <div className="list-wrapper" data-list-id={listNode.id}>
      {/* List header with add button */}
      {/* {!onMeta_test && (
        <div className="list-header">
          <button 
            className="list-add-button"
            onClick={() => addListItem()}
            title="Add item to list"
          >
            + Add item
          </button>
        </div>
      )} */}     
      {/* The list itself */}
      <ul className='list-container'
      style={{direction: onPreferences?.languageDirection,
        flexDirection: listNode.listDirection
      }}
        >
        {sortedItems.map((item) => (
          <li key={item.id} 
          className='list-item-row'
          style={{direction: onPreferences?.languageDirection,
            // width: { listNode.listDirection === "row"} ? "15rem" : "inherirt"
          }}
          // className={`list-item-row ${onPreferences?.languageDirection === 'rtl' ? "reverse" : ""}`}
          >           
            {/* <span className="list-marker">
            {/* List marker (bullet/number) 
              {listNode.tag === 'ol' ? `${index + 1}.` : '•'}
            </span> */}
            <div className="list-item-content">
              <ContentNode
                node={item}
                onapply={onapply}
                onFocus={onFocus}
                onBlur={onBlur}
                onPreferences={onPreferences}
                onMeta_test={onMeta_test}
                onNotfication={onNotficationList}
                onDelete={onDelete}
              />
            </div>
            <div className='div-buttons'>               
              <button
                className="list-item-add"
                onClick={() => addListItem(item.id)}
                title="Add item here"
                >
                  <span>
                +
                  </span>
              </button>
              <DeleteButton nodeTag={"li"}
                visibility={true} 
                lngD={onPreferences?.languageDirection}
                onClick={() => onDelete({nodeId:item.id, nodeParentId:item.parentId, nodeTag: item.tag})} />
              </div>        
          </li>
        ))}
      </ul>
    </div>
  );
};