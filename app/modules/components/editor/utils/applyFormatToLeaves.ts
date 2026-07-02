import { TextLeaf } from "../core/types";

export default function applyFormatToLeaves(
  leaves: TextLeaf[],
  start: number,
  end: number,
  format: keyof Omit<TextLeaf, 'text'>
): TextLeaf[] {
  let offset = 0;
  const result: TextLeaf[] = [];

  for (const leaf of leaves) {
    const leafStart = offset;
    const leafEnd = offset + leaf.text.length;

    // No overlap
    if (leafEnd <= start || leafStart >= end) {
      result.push(leaf);
      offset = leafEnd;
      continue;
    }

    // Split before selection
    if (leafStart < start) {
      result.push({
        ...leaf,
        text: leaf.text.slice(0, start - leafStart)
      });
    }

    // Selected part
    const selectedStart = Math.max(start, leafStart);
    const selectedEnd = Math.min(end, leafEnd);

    result.push({
      ...leaf,
      text: leaf.text.slice(
        selectedStart - leafStart,
        selectedEnd - leafStart
      ),
      [format]: true
    });

    // Split after selection
    if (leafEnd > end) {
      result.push({
        ...leaf,
        text: leaf.text.slice(end - leafStart)
      });
    }

    offset = leafEnd;
  }
   // 🔑 THIS IS THE FIX
  const last = result[result.length - 1];
  if (last && last[format]) {
    result.push({ text: "" }); // ← unformatted caret leaf
  }
  
  return result;
}
