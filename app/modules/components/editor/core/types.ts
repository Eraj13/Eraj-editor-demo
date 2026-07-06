import { Dispatch, SetStateAction } from "react";

export type ActiveMarks = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  link?: { href?: string };
};

export type Section = {
  id: string;
  type: 'text' | 'image';
  content: string;
  placeholder?: string;
};

export  type NodeAction =
   { type: 'ADD_NODE'; tagType: EditorNodeTag, nodeId?: string,imageMeta?: imageMeta}
  | {type: "DELETE_NODE"; nodeId: string, parentId?: string, tagType?: EditorNodeTag, mediaId?: string }
  | { type: 'UPDATE_CONTENT', nodeId: string, children: TextLeaf[], }
  | { type: 'UPDATE_LIST', nodeId: string, list: TextLeaf[][], }
  | { type: 'UPDATE_IMAGE_SRC'; node: EditorNode}
  | { type: 'UPDATE_IMAGE_ALT'; nodeId: string; alt: TextLeaf[]}
  | { type: 'FORMAT_SELECTION'; nodeId: string; anchor: number,
    focus: number; format: keyof Omit<TextLeaf, 'text'>}
  | {type: "CHANGE_LANGUAGE"; direction: "ltr" | "rtl"}
  | {type: "ADD_ULV", nodeId: string}
  | {type: "ADD_LIST", nodeId?: string, listType: EditorNodeTag, listDirection?: "column" | "row"}
  | {type: "ADD_LIST_ITEM", listId: string, afterItemId: string}
  | {type: "UPDATE_LIST_ITEM", itemId: string, content: TextLeaf[]}
 
export type Action =
  | { type: 'ADD_SECTION'; payload: SectionData }
  | { type: 'REMOVE_SECTION'; id: string }
  | { type: 'UPDATE_NODES'; sectionId: string; nodes: ContentNodeData[] }
  | { type: 'INSERT_NODE'; sectionId: string; index: number; node: ContentNodeData }
  | { type: 'UPDATE_NODE'; sectionId: string; nodeId: string; updates: Partial<ContentNodeData> };
  
export type MyTextEditorProps = {
  value?: EditorState;                     // controlled
  defaultValue?: EditorState;              // uncontrolled
  onChange?: (sections: EditorState) => void;
  mode: string;
  onNotification?: Dispatch<SetStateAction<{
    show: boolean;
    message?: string;
}>> 
  placeholder?: string;
  titlePlaceholder?: string;
  readOnly?: boolean;

  onImageUpload?: (file: File) => Promise<string>;
  onVideoUpload?: (file: File) => Promise<string>;

  className?: string;
  meta_test?: boolean,
  isModalOpen?: boolean
};

export type TextLeaf = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  link?:{
    href?:string
  },
};

export type EditorNodeTag  = 'p' | 'h1' | 'h2' | 'blockquote'| 'image' | "ul" | "ol" | "li"

export type EditorNode = {
  id: string;
  tag: EditorNodeTag;
  children: TextLeaf[];
  placeHolder?: string,
  parentId?: string;  
  order?: number;    
  listDirection?:'column' | "row" ;
  imageMeta?: imageMeta,
  direction?: string;
};
export interface imageMeta  {
  src?: string; 
  mediaId?: string;
  alt?: string;
  width?: number;
  height?: number;
  filename?: string; 
  mediaItem?: MediaItem;
}
export interface EditorPreferences {
  languageDirection: 'ltr' | 'rtl';
  theme?: 'light' | 'dark';
  fontSize?: number;
  fontFamily?: string;
  spellCheck?: boolean;
  autoSave?: boolean;
  placeholderText?: string; 
}
export type EditorState = {
  editorNodes: EditorNode[];
  preferences: EditorPreferences;
  metadata?: {
    version?: string;
    lastSaved?: Date;
    wordCount?: number;
    slug_h1?: string,
    meta_title?: string,
    meta_description?: EditorNode,
    meta_keywords?: EditorNode[],  
  };
  nodeMetadata: Map<string, { createdAt: number; order?: number }>;
} 

export type MediaItem = {
  // base64?: string;      
  filename?: string;
  type?: string;
  size?: number;
  uploaded?: boolean;
  uploadUrl?: string; 
  error?: string;
} | undefined;

export const DEFAULT_PREFERENCES: EditorPreferences = {
  languageDirection: 'ltr',
  theme: 'light',
  fontSize: 16,
  fontFamily: 'system-ui, -apple-system, sans-serif',
  spellCheck: true,
  autoSave: true,
  placeholderText: 'Start typing...'
};

export interface SaveNotificationProps {
  onNotification:  {
    show: boolean;
    message?: string;
  },
  duration?: number;
  onHide?: () => void;
}

export type ContentNodeProps = {
  node: EditorNode;
  onFocus: (rect: HTMLElement, id: string,) => void;
  onBlur: (id: string, children: TextLeaf[],) => void;
  onapply: (action: NodeAction) => void,
  onPreferences: EditorPreferences | undefined,
  onMeta_test?: boolean,
  onNotfication?: React.Dispatch<React.SetStateAction<{
    show: boolean;
    message?: string;
    }>>
  onDelete: (nodeId: string, nodeParentId?: string, tagType?: EditorNodeTag, mediaId?: string) => void;
};

export interface ListContainerProps {
  listNode: EditorNode; // The ul/ol node
  items: EditorNode[];  // All li nodes with parentId = listNode.id
  onapply: (action: NodeAction) => void;
  onFocus: (element: HTMLElement, nodeId: string) => void;
  onBlur: (nodeId: string, content: TextLeaf[]) => void;
  onPreferences: EditorPreferences;
  onMeta_test?: boolean;
  onNotficationList?: React.Dispatch<React.SetStateAction<{
    show: boolean;
    message?: string;
    }>>
  onDelete: (nodeId: string, nodeParentId?: string) => void;
}

export type fabContainerProps = {
  mode: "DEFAULT" | "NORMAL"
  onisOpen: boolean,
  onsetIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
  onActiveNode: string | null,
  onNodeId?: string,
  onapply: (action: NodeAction) => void,
  newnode?: boolean;
  lnd?: "rtl" | "ltr"
}
export interface SectionPosition {
  top: number;
  left: number;
  height: number;
  sectionId: string;
}
export type toolbarState_Prop = {
  show: boolean;
  showLinkInput: boolean;
  position?: { top: number; left: number };
  context: { nodeId: string } | null;
}

export type ContentNodeData = {
  id: string;
  type: 'paragraph' | 'blockquote' | 'image' | 'linebreak';
  content: string;
  placeholder?: string;
  imageMeta?: {
    url?: string;
    alt?: string;
  };
};

export type SectionData = {
  id: string;
  nodes: ContentNodeData[];
};

export type EditorSelection = {
  nodeId: string;
  anchor: number; 
  focus: number;  
} | null;

export type Selection = {
  nodeId: string;
  offset: number;      
}

export interface FabContainerProps {
  onAddImage: (node: EditorNode) => void;
  onAddNewParagraph:(type: "p" | "blockquote") => void;
}

export type blurUpdate_Prop ={
    id: string;
    tag: EditorNodeTag,
    content: TextLeaf[]
  }

  export interface DirectionToggleProps {
    initialDirection?: 'ltr' | 'rtl';
    // onToggle: (direction: 'ltr' | 'rtl') => void;
    onToggle: () => void;
    //  onClick: ()=> void
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    onAnimation: boolean,
    onDirection: "ltr" | "rtl"
  }
  