import { TextLeaf } from "../core/types";

export function parseInlineHtmlToTextLeaves(html: string): TextLeaf[] {
  const container = document.createElement('div');
  container.innerHTML = html;
  const result: TextLeaf[] = [];
  container.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      result.push({ text: node.textContent ?? '' });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const base: TextLeaf = {
        text: el.textContent ?? '',
      };
      if (el.tagName === 'STRONG' || el.tagName === 'B') {
        base.bold = true;
      } else if (el.tagName === 'EM' || el.tagName === 'I') {
        base.italic = true;
      } else if (el.tagName === 'A') {
        base.link = {
          href: el.getAttribute('href') ?? '',
        };
      }
      result.push(base);
    }
  });
  
  return result;
}

