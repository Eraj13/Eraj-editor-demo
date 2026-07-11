import { blurUpdate_Prop, DEFAULT_PREFERENCES, EditorNode, EditorNodeTag, EditorState, NodeAction, TextLeaf, EditorPreferences, imageMeta } from '../core/types';
import { STORAGE_KEY } from './constants';
import { saveImageToIndexedDB } from './indexDB';

export const generateId = () => Math.random().toString(36).slice(2, 11);

export const emptyState = {
  preferences: DEFAULT_PREFERENCES ,
  nodeMetadata: new Map(),
  mediaStore: new Map()
  ,editorNodes:[]
}
export const createDefaultNode = (meta_test?:boolean): EditorState =>{
  const firstId = generateId();
  const newnodeMetadata = new Map();
  newnodeMetadata.set(firstId, { createdAt: Date.now() });
  return ({
  preferences: DEFAULT_PREFERENCES ,
  nodeMetadata: newnodeMetadata
  ,editorNodes:[
  {
  id: `${meta_test ? "meta_test" : ''}+${firstId}`,
  tag: 'h1',
  children: [],
  placeHolder:'Tiltle',
  },
]})};

export function loadInitialState(defaultValue?: EditorState, meta_test?: boolean): EditorState {

  const saved = localStorage.getItem('editor-draft');
  if (saved && saved.length > 0 && !meta_test) {
      const parsed = JSON.parse(saved);
        return ({
          editorNodes: parsed.editorNodes,
          preferences: parsed.preferences,
          nodeMetadata: parsed.nodeMetadata,
        });
  } else {
  const nodes = defaultValue?.editorNodes && defaultValue.editorNodes.length > 0 
    ? defaultValue 
    : emptyState;
  
  return {
    editorNodes: nodes.editorNodes,
    preferences: DEFAULT_PREFERENCES,
    nodeMetadata: nodes.nodeMetadata,
  };
}
}


export const slugifyFilename = (originalName: string): string => {
  const nameWithoutExt = originalName
    .replace(/\.[^/.]+$/, '')                // Remove extension
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')             // Replace non-alphanumeric with hyphen
    .replace(/^-+|-+$/g, '');                // Trim leading/trailing hyphens
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  const randomSuffix = Math.random().toString(36).substring(2, 8); // 6-char unique ID
  return `${nameWithoutExt}-${randomSuffix}.${extension}`;
};


function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')     // Remove non-word characters
    .replace(/\s+/g, '-')         // Replace spaces with -
    .replace(/--+/g, '-')         // Replace multiple - with single -
    .slice(0, 60);                // Optional: limit length
}

const extractText_re = (arr: TextLeaf[]) => {
    const extractArr: string[] = [];
    arr.map((el) => {
      if(el.text) extractArr.push(el.text);
      if(el.link?.href) extractArr.push(el.link.href);
    })
 
  return extractArr;
}

export function metaDescription_returner(nodes: EditorNode[]): TextLeaf[] {
  const descriptionText = nodes
    .filter(n => n.tag === 'p')
    .map(p => extractText_re(p.children))
    .join(' ')
    .slice(0, 160);
  return [{text:descriptionText}]
 
}

export const extractKeywords = (nodes: EditorNode[], count = 8, ): TextLeaf[]=> {
    const commonWords = new Set([
      'the', 'and', 'that', 'this', 'with', 'have', 'you', 'for',
      'are', 'but', 'not', 'your', 'from', 'what', 'was', 'can', 'all','there',
      // Persian/Arabic common words
      'و', 'به', 'از', 'در', 'این', 'آن', 'با', 'برای', 'که', 'را', 'تا', 'بر', 'هم','چی','چرا',
      // ... add more as needed
    ]);
    
    const unicodeWordRegex = /[\p{L}\p{N}]+/gu;
    const arrofwords = nodes.filter(n => n.tag !== 'image').map(node => node.children).flat();
    
    const words = extractText_re(arrofwords)
    .join(" ")
      .toLowerCase()
      .match(unicodeWordRegex)
      ?.filter(w => w.length > 3 && !commonWords.has(w))

    const freq: Record<string, number> = {};
    if(words) for (const word of words) {
      freq[word] = (freq[word] || 0) + 1;
    }
   
    const newArr = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([word]) => {return {text: word}});
    return newArr
  };

export const generateSeoMetaFromNodes = (states:EditorState ) => {
  const nodes = states.editorNodes;
  const titleNode = nodes.find(n => n.tag === 'h1');
  const slug_h1 = titleNode ? slugify(titleNode.children.map(child => child.text).join('')) : 'untitled-article';

  const titleText = titleNode ? extractText_re(titleNode.children) : 'Untitled Article';

  const descriptionText: EditorNode = {id: 'Meta_test-header', tag: "p", children: metaDescription_returner(nodes)};

  const listParent : EditorNode= {
      id: generateId(),
      tag: "ul",
      children: [],
      listDirection: "row"
  }
    
  const keywords: EditorNode[] = extractKeywords(nodes,undefined)
  .map((el) => {
      return {
        id: generateId(),
        parentId: listParent.id,
        tag: "li",
        children: [el],
      }
    });

  keywords.unshift(listParent);
  return {
    titleNode,
    slug_h1,
    meta_title: `${titleText} | Islamic`, // customize site name
    meta_description: descriptionText,
    keywords,
  };
}

export function ensureTextNode(children?: TextLeaf[]): TextLeaf[] {
  if (!children || children.length === 0) {
    return [{ text: '' }];
  }
  return children;
}

export const blurUpdate = (prop: blurUpdate_Prop, apply: (action: NodeAction) => void) => {
    if(prop.tag === "image") apply({
      type: 'UPDATE_IMAGE_ALT',
      nodeId: prop.id,
      alt: prop.content 
    })
    else if (prop.tag === 'li') {
    apply({
      type: 'UPDATE_LIST_ITEM',
      itemId: prop.id,
      content: prop.content
    });
    }
    else apply({
      type: 'UPDATE_CONTENT',
      nodeId: prop.id,
      children: prop.content
    })
}

export const turnPlaceHolder = (tag: string) => {
    if(tag === "h1") return "عنوان"
    if(tag === "p") return "شروع به نوشتن متن کنید"
    if(tag === "image") return "عنوانی اضافه کنید"
    if(tag === "blockquote") return "نقل و قولی بنویسید"
    if(tag === "li") return "مورد بنویسید "
}

export const placeHolder_re = (tag: EditorNodeTag, lng?: "ltr" | "rtl"  ) => {
  if(lng === "rtl") {
    return turnPlaceHolder(tag);
  }
  else
    if(tag === "p") return "Type something...";
    if(tag === "blockquote") return "Type quote";
    if(tag === "li") return "Type list item";
    if(tag === "h1") return "Type header";
    if(tag === "h2") return "Type sub header";
    if(tag === "image") return "Type caption"
}

export const addNode = (type: EditorNodeTag, onapply: ((action: NodeAction) => void), nodeId?: string, listDirection?: "column" | "row", imageMeta?: imageMeta) => {
    if(type !== "ul" && type !== "li" && type !== "ol") { 
      const imageId = generateId();
      if(!imageMeta?.isUrl) addImageNodeToIndexDb(imageId, imageMeta?.src);
      onapply({
        type: 'ADD_NODE',
        tagType: type,
        nodeId,
        imageMeta: {...imageMeta, 
          mediaId: imageId, 
          src: imageMeta?.isUrl ? imageMeta.src : `imageId-${imageId}`}
      });
      // requestAnimationFrame(() => {
      // const element= document.querySelector(`[data_node_id="${imageId}"]`) as HTMLElement;
      // console.log("element",element)
      // element.scrollIntoView({behavior: 'smooth', block: 'end'})
      // })
    }
    else {
      onapply({
            type: 'ADD_LIST',
            nodeId: nodeId,
            listType: type,
            listDirection: listDirection
      })
    }
    if(nodeId) requestAnimationFrame(() => {
      const element= document.querySelector(`[data_node_id="${nodeId}"]`) as HTMLElement;
      if (element) {
        element.focus(); 
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(element);
        range.collapse(false); // false = collapse to end
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    })
  }; 

  // ✅ Async logic outside reducer
export const addImageNodeToIndexDb = async (imageId: string, src?: string ) => {
  await saveImageToIndexedDB(imageId, src);
};

// utils/downloadJSON.ts
export const downloadJSON = (data: EditorState, filename: string = 'article.json') => {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const saveToLocal = (newState: EditorState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newState, null, 2));
} 

// ✅ Demo — opens the JSON as a formatted view in a new tab
  export const viewJSON = (nodes: EditorState) => {
    const jsonString = JSON.stringify(nodes, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // ✅ Opens the JSON in a new tab (as a file)
    window.open(url, '_blank');
    
    // ✅ Clean up after a moment
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };


export const handleSaveAsJSON = (nodes: EditorState) => {
  // metadata gets created
  const { 
    // titleNode,
    slug_h1,
    meta_title, // customize site name
    meta_description,
    keywords
  } = generateSeoMetaFromNodes(nodes);

  const articleData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    editorNodes: nodes.editorNodes,  // Your editor nodes
    metadata: {
      slug_h1,
      meta_title, 
      meta_description,
      meta_keywords: [...keywords],
    },
    nodeMetadata: nodes.nodeMetadata,    // Optional: metadata
    preferences: nodes.preferences,
  };
  downloadJSON(articleData, `article-${Date.now()}.json`);
};