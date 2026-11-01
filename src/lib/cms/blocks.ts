/**
 * Types for Strapi's native blocks (rich text) field.
 *
 * Strapi publishes an official renderer for this, but its package runs
 * `husky install` in a `prepare` script, which fails on any machine without
 * husky — including a clean CI checkout. Since every node's markup is specified
 * by this project anyway, the format is modelled here and walked by
 * components/cms/rich-text.tsx instead of taking on that dependency.
 */

export interface TextNode {
  type: 'text';
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
}

export interface LinkNode {
  type: 'link';
  url: string;
  children: TextNode[];
}

export type InlineNode = TextNode | LinkNode;

export interface ParagraphNode {
  type: 'paragraph';
  children: InlineNode[];
}

export interface HeadingNode {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: InlineNode[];
}

export interface ListItemNode {
  type: 'list-item';
  children: (InlineNode | ListNode)[];
}

export interface ListNode {
  type: 'list';
  format: 'ordered' | 'unordered';
  /** Lists nest: an item may contain another list. */
  children: (ListItemNode | ListNode)[];
}

export interface QuoteNode {
  type: 'quote';
  children: InlineNode[];
}

export interface CodeNode {
  type: 'code';
  children: TextNode[];
}

export interface ImageNode {
  type: 'image';
  image: {
    url: string;
    alternativeText: string | null;
    width: number | null;
    height: number | null;
  };
}

export interface TableCellNode {
  type?: 'table-cell';
  children: InlineNode[];
}

export interface TableNode {
  type: 'table';
  headers?: TableCellNode[];
  rows: TableCellNode[][];
}

export type BlockNode =
  | ParagraphNode
  | HeadingNode
  | ListNode
  | QuoteNode
  | CodeNode
  | ImageNode
  | TableNode;

export type BlocksContent = BlockNode[];

export const isTextNode = (node: InlineNode): node is TextNode => node.type === 'text';
export const isListNode = (node: { type: string }): node is ListNode => node.type === 'list';
export const isTableNode = (node: { type: string }): node is TableNode => node.type === 'table';

/**
 * Flattens a blocks value to the words a reader sees.
 *
 * Written for structured data, where an answer has to be a plain string. Link
 * labels and list items are kept because they are on the page — schema.org text
 * that says less than the visible answer is exactly the mismatch a search engine
 * reads as cloaking.
 *
 * Not to be confused with the heading slugifier in components/cms/rich-text.tsx,
 * which drops link text deliberately: an anchor is derived from a heading, not a
 * transcript of it.
 */
export function blocksToText(content: BlocksContent | null | undefined): string {
  if (!content?.length) return '';

  return content
    .map(blockText)
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function blockText(node: BlockNode): string {
  switch (node.type) {
    case 'paragraph':
    case 'heading':
    case 'quote':
      return inlineText(node.children);
    case 'code':
      return node.children.map((child) => child.text).join('');
    case 'list':
      return listText(node);
    case 'table':
      return [
        ...(node.headers ? node.headers.map((h) => inlineText(h.children)) : []),
        ...node.rows.flatMap((r) => r.map((c) => inlineText(c.children))),
      ].join(' ');
    default:
      // An image is the only node carrying no words of its own — its alt text
      // describes the picture rather than continuing the sentence.
      return '';
  }
}

/** Items joined on a space: a list read aloud is a sequence, not one word. */
function listText(node: ListNode): string {
  return node.children
    .map((child) => (isListNode(child) ? listText(child) : itemText(child)))
    .join(' ');
}

function itemText(node: ListItemNode): string {
  return node.children
    .map((child) => (isListNode(child) ? listText(child) : inlineText([child])))
    .join('');
}

function inlineText(nodes: InlineNode[]): string {
  return nodes
    .map((node) => (isTextNode(node) ? node.text : inlineText(node.children)))
    .join('');
}
