import { TextLeaf } from "../core/types";

export function insertLeafAtOffset(
  leaves: TextLeaf[],
  offset: number,
  newLeaf: TextLeaf
): TextLeaf[] {
  let currentOffset = 0;
  const result: TextLeaf[] = [];

  for (const leaf of leaves) {
    const leafText = leaf.text;
    const leafStart = currentOffset;
    const leafEnd = currentOffset + leafText.length;

    if (offset >= leafStart && offset <= leafEnd) {
      const splitIndex = offset - leafStart;

      if (splitIndex > 0) {
        result.push({
          ...leaf,
          text: leafText.slice(0, splitIndex),
        });
      }

      result.push(newLeaf);

      if (splitIndex < leafText.length) {
        result.push({
          ...leaf,
          text: leafText.slice(splitIndex),
        });
      }
    } else {
      result.push(leaf);
    }

    currentOffset += leafText.length;
  }

  return result;
}
