export function getOffsetWithin(root: HTMLElement, node: Node, offset: number) {
  let count = 0;

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    null
  );

  let current: Node | null = walker.nextNode();

  while (current) {
    if (current === node) {
      return count + offset;
    }
    count += current.textContent?.length ?? 0;
    current = walker.nextNode();
  }

  return count;
}
// ~~~~~~~~~~ RESTORE SELECTION ~~~~~~~~~~~~
export function captureSelection(
  root: HTMLElement,
  nodeId: string
) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;

  const range = sel.getRangeAt(0);

  return {
    nodeId,
    offset: getOffsetWithin(
      root,
      range.startContainer,
      range.startOffset
    )
  };
}
export function findDomPosition(
  root: HTMLElement,
  offset: number
) {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    null
  );

  let currentOffset = 0;
  let node: Node | null = walker.nextNode();

  while (node) {
    const len = node.textContent?.length ?? 0;

    if (currentOffset + len >= offset) {
      return {
        node,
        offset: offset - currentOffset
      };
    }

    currentOffset += len;
    node = walker.nextNode();
  }

  return null;
}
export function restoreSelection(
  root: HTMLElement,
  offset: number
) {
  const pos = findDomPosition(root, offset);
  if (!pos) return;

  const range = document.createRange();
  range.setStart(pos.node, pos.offset);
  range.collapse(true);

  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
}
export function getNodeElementById(nodeId: string): HTMLElement | null {
  return document.querySelector(
    `[data-node-id="${nodeId}"]`
  ) as HTMLElement | null;
}
