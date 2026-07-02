import { EditorState } from "../editor/core/types"

export type RichTextEditorProps = {
  onPublish: (data: EditorState) => Promise<void>,
  meta_data?: boolean
}