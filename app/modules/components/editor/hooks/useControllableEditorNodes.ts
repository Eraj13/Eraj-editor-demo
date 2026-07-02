import { useCallback, useReducer, } from "react";
import { editorNodeReducer } from "../core/reducer";
import {  loadInitialState } from "../utils/utils";
import { EditorState, NodeAction } from "../core/types";

export default function useControllableEditorNodes(
  value?: EditorState,
  defaultValue?: EditorState,
  onChange?: (state: EditorState) => void,
  meta_test?: boolean,
) {
  const isControlled = value !== undefined;
  const [internalNodes, dispatch] = useReducer(
    editorNodeReducer,
    loadInitialState(defaultValue,meta_test),
  );

  const state = isControlled ? value! : internalNodes;
  // const state = internalNodes;
  const apply = useCallback(
    (action: NodeAction) => {
      const next = editorNodeReducer(state, action);

      if (!isControlled) {
        dispatch(action);
      }

      onChange?.(next);
    },
    [state, isControlled, onChange]
  );
  return { state, apply };
}
