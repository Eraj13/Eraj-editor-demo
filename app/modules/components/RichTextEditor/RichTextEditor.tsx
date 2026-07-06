'use client';
import { EditorNode, EditorState } from "@/app/modules/components/editor/core/types";
import { createDefaultNode, downloadJSON, emptyState, generateSeoMetaFromNodes } from "@/app/modules/components/editor/utils/utils";
import { useState, } from "react";
import './RichTextEditor.css';
import { SaveNotification } from "@/app/modules/components/editor/react/saveNotification";
import { RichTextEditorProps } from "./types";
import dynamic from "next/dynamic";

// ✅ Dynamic import with SSR disabled
const MyTextEditor = dynamic(
  () => import('../editor/react/Mytext').then((mod) => mod.MyTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="loading-editor">
        Loading editor...
      </div>
    ),
  }
);

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  onPublish,
  meta_data,
}) => {
 
  const [isLoading, setIsLoading] = useState(false);
  const [nodes, setNodes] = useState<EditorState>(emptyState); 
  const [metadata_, setMetadata] = useState<EditorState>(emptyState);
  const [isModalOpen, setisModalOpen] = useState(false);
  const [showSaveNotification, setNotification] = useState<({show: boolean, message?: string})>({show: false, message: "saved"});
  
  const metaComputing = ()=> {
    const { 
      titleNode,
      slug_h1,
      meta_title, // customize site name
      meta_description,
      keywords
    } = generateSeoMetaFromNodes(nodes);

    if(titleNode?.children.length ) setisModalOpen(true);
   
    const header_picture: EditorNode = nodes.editorNodes.find((n) => n.tag == "image") || {id: 'header_pic_meta', tag: 'image', children: []};
  
    if(titleNode) setMetadata({
      editorNodes: [
        header_picture,
        titleNode,
         meta_description, 
         ...keywords],
      metadata: {...nodes.metadata, slug_h1,
      meta_title, 
      meta_description,
      meta_keywords: [...keywords],
      },    
      preferences: {...metadata_.preferences, languageDirection: nodes.preferences.languageDirection},
      nodeMetadata: nodes.nodeMetadata || new Map(),
    });      
  }

  async function handlePublish() {
    // setIsLoading(true);
    // add meta data to nodes.
    onPublish(nodes);
    localStorage.removeItem('editor-draft');
    setisModalOpen(false);
    setNodes(createDefaultNode());
    setNotification({show: true,message: "Transfered properly."});
    setIsLoading(false);
  }
  // In your RichTextEditor or page.tsx
const handleSaveAsJSON = () => {
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

// ✅ Demo — opens the JSON as a formatted view in a new tab
  const viewJSON = () => {
    const jsonString = JSON.stringify(nodes, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // ✅ Opens the JSON in a new tab (as a file)
    window.open(url, '_blank');
    
    // ✅ Clean up after a moment
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };
  return (
    <div className={"eraj-editor"}>
      <h1 className={"eraj-editor_h1"}>Creating a new Article</h1>
      <MyTextEditor mode="article" onChange={setNodes} key="article" meta_test={false} isModalOpen={isModalOpen} onNotification={setNotification} />
      {isModalOpen && meta_data && (
      <div className="modal">
        <MyTextEditor value={metadata_} mode="meta_test" onChange={setMetadata} key="meta_test" meta_test={true}  />
        <div className="button-div">
          <button className="button_meta button_meta_conf" onClick={handlePublish}>
            Confirm and Publish
          </button>
          <button className="button_meta button_meta_can" onClick={() =>{
            setMetadata(createDefaultNode(true))
            setisModalOpen(false)}
          }>
            Cancel
          </button>
        </div>
      </div>
      )}
       <div className={`editor-controls ${isModalOpen ? "dim" : ""}`} inert={isModalOpen ? true : false}>
          <button
            className={`publish-button ${isLoading ? 'button-loading' : ''}`}
            onClick={metaComputing}
            disabled={isLoading}
          >
            Proceed to Publish
          </button>
          
      <SaveNotification 
        onNotification={showSaveNotification}
        onHide={() => setNotification({show: false})}
      />
    </div>
    <button className="btn-download" onClick={handleSaveAsJSON} title="Download article as JSON file">
      <span className="icon">DOWNLOAD JSON⬇️</span>
    </button>
    <button className="btn-view" onClick={viewJSON}>
      <span className="icon">👁️ View JSON</span>
    </button>
    </div>    
  )
}
  {/* {isPublishing ? (
              <>
                <span className="spinner" />
                Publishing...
              </>
            ) : 'Publish'}
          </button>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )} */}