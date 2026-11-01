import Image from 'next/image';
import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';

import { getCardTheme } from '@/components/cms/card-theme';
import {
  isListNode,
  isTextNode,
  type BlockNode,
  type BlocksContent,
  type InlineNode,
  type ListItemNode,
  type ListNode,
  type ParagraphNode,
  type TableCellNode,
  type TableNode,
} from '@/lib/cms/blocks';
import { cn } from '@/lib/cn';
import { mediaUrl } from '@/lib/cms/media';
import { SITE_URL } from '@/lib/env';

/**
 * Renders Strapi's native blocks field with premium visual UI templates.
 */
export function RichText({
  content,
  idPrefix,
}: {
  content: BlocksContent | null | undefined;
  idPrefix?: string;
}) {
  if (!content?.length) return null;

  const normalizedBlocks = preprocessBlocks(content);
  const anchors = headingAnchors(normalizedBlocks, idPrefix);

  return (
    <div className="w-full space-y-4">
      {normalizedBlocks.map((node, index) => (
        <Block key={index} node={node} id={anchors[index]} />
      ))}
    </div>
  );
}

function isTableParagraph(node: BlockNode): boolean {
  if (node.type !== 'paragraph') return false;
  const text = plainText(node.children).trim();
  return text.startsWith('|') && text.endsWith('|');
}

const isSeparatorLine = (text: string) => /^\|?(\s*:?-+:?\s*\|?)+$/.test(text.trim());

function splitParagraphIntoCells(node: ParagraphNode): TableCellNode[] {
  const cells: TableCellNode[] = [];
  let currentCellChildren: InlineNode[] = [];
  const rawFull = plainText(node.children).trim();
  const isWrapped = rawFull.startsWith('|') && rawFull.endsWith('|');

  for (const child of node.children) {
    if (child.type === 'text') {
      const parts = child.text.split('|');
      for (let i = 0; i < parts.length; i++) {
        if (i > 0) {
          if (currentCellChildren.length > 0) {
            cells.push({ children: currentCellChildren });
            currentCellChildren = [];
          }
        }
        const partText = parts[i];
        if (partText) {
          currentCellChildren.push({ ...child, text: partText });
        }
      }
    } else {
      currentCellChildren.push(child);
    }
  }
  if (currentCellChildren.length > 0) {
    cells.push({ children: currentCellChildren });
  }

  let finalCells = cells.map((cell) => ({
    children: cell.children.map((c) =>
      isTextNode(c) ? { ...c, text: c.text.trim() } : c
    ),
  }));

  if (isWrapped && finalCells.length >= 2) {
    if (finalCells[0].children.every((c) => isTextNode(c) && c.text === '')) {
      finalCells = finalCells.slice(1);
    }
    if (
      finalCells.length > 0 &&
      finalCells[finalCells.length - 1].children.every((c) => isTextNode(c) && c.text === '')
    ) {
      finalCells = finalCells.slice(0, -1);
    }
  }

  return finalCells;
}

function preprocessBlocks(nodes: BlocksContent): BlocksContent {
  const result: BlockNode[] = [];
  let tableBuffer: ParagraphNode[] = [];

  const flushTable = () => {
    if (tableBuffer.length >= 2) {
      const p0Text = plainText(tableBuffer[0].children).trim();
      const p1Text = plainText(tableBuffer[1].children).trim();

      let headers: TableCellNode[] = [];
      let rowParas: ParagraphNode[] = [];

      if (isSeparatorLine(p1Text)) {
        headers = splitParagraphIntoCells(tableBuffer[0]);
        rowParas = tableBuffer.slice(2);
      } else {
        headers = splitParagraphIntoCells(tableBuffer[0]);
        rowParas = tableBuffer.slice(1).filter((p) => !isSeparatorLine(plainText(p.children)));
      }

      const rows: TableCellNode[][] = rowParas.map((p) => splitParagraphIntoCells(p));

      result.push({
        type: 'table',
        headers,
        rows,
      });
      tableBuffer = [];
      return;
    }

    for (const raw of tableBuffer) {
      result.push(raw);
    }
    tableBuffer = [];
  };

  for (const node of nodes) {
    if (node.type === 'table') {
      flushTable();
      result.push(node);
      continue;
    }

    if (isTableParagraph(node)) {
      tableBuffer.push(node as ParagraphNode);
      continue;
    }

    flushTable();
    result.push(node);
  }
  flushTable();
  return result;
}

/** Lowercase, non-alphanumerics to hyphens, no leading or trailing run. */
const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const plainText = (nodes: InlineNode[]) =>
  nodes.map((node) => (isTextNode(node) ? node.text : '')).join('');

function headingAnchors(
  content: BlocksContent,
  prefix?: string
): (string | undefined)[] {
  const taken = new Set<string>();

  return content.map((node, index) => {
    if (node.type !== 'heading') return undefined;

    const base = slugify(plainText(node.children));
    if (!base) return undefined;

    const slug = taken.has(base) ? `${base}-${index}` : base;
    taken.add(slug);
    return prefix ? `${prefix}-${slug}` : slug;
  });
}

function Block({ node, id }: { node: BlockNode; id?: string }) {
  switch (node.type) {
    case 'paragraph': {
      const isBlank = node.children.every(
        (child) => isTextNode(child) && child.text.trim() === ''
      );
      if (isBlank) return null;
      return (
        <p className="text-base sm:text-[1.05rem] leading-relaxed text-ink-800/90 font-normal">
          <Inlines nodes={node.children} />
        </p>
      );
    }

    case 'heading': {
      const level = Math.min(6, Math.max(2, node.level)) as 2 | 3 | 4 | 5 | 6;
      const Tag = `h${level}` as 'h2';

      if (level === 2) {
        return (
          <div className="mt-8 mb-4 pt-2 first:mt-0">
            <Tag
              id={id}
              className="scroll-mt-32 font-display text-lg sm:text-xl font-bold text-ink-950 flex items-center gap-2.5 tracking-tight"
            >
              <span className="flex size-7 sm:size-8 shrink-0 items-center justify-center rounded-lg bg-brand-800 text-white shadow-xs">
                <svg viewBox="0 0 20 20" className="size-4" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
              </span>
              <span><Inlines nodes={node.children} /></span>
            </Tag>
          </div>
        );
      }

      if (level === 3) {
        return (
          <Tag
            id={id}
            className="mt-6 mb-3 scroll-mt-32 font-display text-base sm:text-lg font-bold text-ink-900 first:mt-0 flex items-center gap-2"
          >
            <span className="inline-block size-2 rounded-full bg-brand-700 ring-4 ring-brand-100" aria-hidden="true" />
            <span><Inlines nodes={node.children} /></span>
          </Tag>
        );
      }

      return (
        <Tag
          id={id}
          className="mt-5 mb-2 scroll-mt-32 font-display text-sm sm:text-base font-semibold text-ink-900 first:mt-0"
        >
          <Inlines nodes={node.children} />
        </Tag>
      );
    }

    case 'list':
      return <List node={node} />;

    case 'quote':
      return (
        <div className="relative my-6 overflow-hidden rounded-2xl border border-brand-200/90 bg-gradient-to-r from-brand-50/90 via-white to-brand-50/40 p-5 sm:p-6 shadow-xs">
          <div className="absolute top-0 left-0 h-full w-1.5 bg-brand-700" />
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-800 shadow-2xs" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="size-5.5" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            </div>
            <div className="min-w-0 text-sm sm:text-base leading-relaxed text-ink-900 font-medium italic">
              <Inlines nodes={node.children} />
            </div>
          </div>
        </div>
      );

    case 'code':
      return (
        <pre className="my-4 overflow-x-auto rounded-xl bg-ink-950 p-4 text-sm text-ink-100 font-sans shadow-inner">
          <code>{node.children.map((child) => child.text).join('')}</code>
        </pre>
      );

    case 'image': {
      const src = mediaUrl(node.image.url);
      if (!src) return null;
      return (
        <div className="my-5 overflow-hidden rounded-2xl border border-ink-200/80 shadow-md">
          <Image
            src={src}
            alt={node.image.alternativeText ?? ''}
            width={node.image.width ?? 1200}
            height={node.image.height ?? 675}
            className="h-auto w-full object-cover"
          />
        </div>
      );
    }

    case 'table':
      return <Table node={node} />;

    default:
      return null;
  }
}

function Table({ node }: { node: TableNode }) {
  if (!node.rows || node.rows.length === 0) return null;

  return (
    <div className="my-6 w-full overflow-hidden rounded-2xl border border-ink-200/90 bg-white shadow-xs transition-all duration-200 hover:shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[520px]">
          {node.headers && node.headers.length > 0 && (
            <thead>
              <tr className="border-b border-ink-200/90 bg-gradient-to-r from-brand-900 via-brand-950 to-brand-900 text-white">
                {node.headers.map((h, i) => (
                  <th
                    key={i}
                    scope="col"
                    className="px-4.5 py-3 text-xs sm:text-[0.825rem] font-semibold uppercase tracking-wider text-white border-r last:border-r-0 border-white/10"
                  >
                    <Inlines nodes={h.children} />
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-ink-100/90">
            {node.rows.map((row, rIdx) => (
              <tr
                key={rIdx}
                className={cn(
                  'transition-colors duration-150 hover:bg-brand-50/40',
                  rIdx % 2 === 1 ? 'bg-ink-50/40' : 'bg-white'
                )}
              >
                {row.map((cell, cIdx) => (
                  <td
                    key={cIdx}
                    className={cn(
                      'px-4.5 py-3 text-sm sm:text-[0.95rem] leading-relaxed border-r last:border-r-0 border-ink-100/70',
                      cIdx === 0 ? 'font-semibold text-ink-950' : 'text-ink-800 font-normal'
                    )}
                  >
                    <Inlines nodes={cell.children} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Check if list item has a "Key: Value" or "Key - Value" pattern */
function parseKeyValue(text: string): { key: string; value: string } | null {
  const colonIdx = text.indexOf(':');
  if (colonIdx > 2 && colonIdx < 60) {
    const key = text.slice(0, colonIdx).trim();
    const value = text.slice(colonIdx + 1).trim();
    if (key.length > 0 && value.length > 0) {
      return { key, value };
    }
  }
  return null;
}

function List({ node, nested = false }: { node: ListNode; nested?: boolean }) {
  if (nested) {
    const Tag = node.format === 'ordered' ? 'ol' : 'ul';
    return (
      <Tag className="mt-2 ml-5 space-y-1.5 list-disc text-ink-700">
        {node.children.map((child, index) =>
          isListNode(child) ? (
            <List key={index} node={child} nested />
          ) : (
            <li key={index} className="leading-relaxed text-sm font-normal">
              <Inlines nodes={child.children as InlineNode[]} />
            </li>
          )
        )}
      </Tag>
    );
  }

  // --- 1. Ordered List: Step-by-Step Connected Roadmap Cards ---
  if (node.format === 'ordered') {
    return (
      <div className="my-6 space-y-3.5">
        {node.children.map((child, index) => {
          if (isListNode(child)) return <List key={index} node={child} nested />;
          const fullText = plainText(child.children as InlineNode[]);
          const kv = parseKeyValue(fullText);
          const stepNum = String(index + 1).padStart(2, '0');

          return (
            <div
              key={index}
              className="group relative flex items-start gap-4 sm:gap-5 rounded-2xl border border-ink-200/90 bg-white p-4.5 sm:p-5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md hover:shadow-brand-900/5"
            >
              {/* Step Badge */}
              <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-800 to-brand-950 font-display text-sm font-semibold text-white shadow-sm ring-4 ring-brand-100">
                {stepNum}
              </div>

              {/* Step Content */}
              <div className="min-w-0 flex-1 pt-0.5">
                {kv ? (
                  <div>
                    <h3 className="font-display text-sm sm:text-base font-semibold text-ink-950 mb-1 tracking-tight">
                      {kv.key}
                    </h3>
                    <p className="text-sm sm:text-base leading-relaxed text-ink-700 font-normal">
                      {kv.value}
                    </p>
                  </div>
                ) : (
                  <div className="text-sm sm:text-base leading-relaxed text-ink-800 font-normal">
                    <Inlines nodes={child.children as InlineNode[]} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // --- 2. Unordered List: Check if mostly Key-Value items -> Premium Feature Cards Grid ---
  const itemTexts = node.children
    .filter((c) => !isListNode(c))
    .map((c) => plainText((c as ListItemNode).children as InlineNode[]));
  
  const kvCount = itemTexts.filter((t) => parseKeyValue(t) !== null).length;
  const isKeyValueGrid = itemTexts.length >= 2 && kvCount >= Math.ceil(itemTexts.length * 0.6);

  if (isKeyValueGrid) {
    return (
      <div className="my-6 grid gap-4 sm:grid-cols-2">
        {node.children.map((child, index) => {
          if (isListNode(child)) return <List key={index} node={child} nested />;
          const text = plainText(child.children as InlineNode[]);
          const kv = parseKeyValue(text);

          if (kv) {
            const theme = getCardTheme(kv.key);

            return (
              <div
                key={index}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-ink-200/90 bg-gradient-to-br ${theme.cardBg} p-5 sm:p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${theme.accentBorder}`}
              >
                {/* Top Row: Contextual Icon + Category Pill Badge */}
                <div className="flex items-center justify-between gap-3">
                  <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${theme.iconBg} ring-1 border shadow-2xs transition-transform duration-200 group-hover:scale-105`}>
                    {theme.icon}
                  </div>
                  <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-2xs font-medium uppercase tracking-wider ${theme.badgeStyle} border shadow-2xs`}>
                    {theme.badgeLabel}
                  </span>
                </div>

                {/* Title (Key) & Value Content */}
                <div className="mt-4 flex-1">
                  <h3 className="font-display text-sm sm:text-base font-semibold uppercase tracking-tight text-ink-950">
                    {kv.key}
                  </h3>
                  <p className="mt-2 text-sm sm:text-[0.95rem] font-normal leading-relaxed text-ink-700">
                    {kv.value}
                  </p>
                </div>

                {/* Subtle Decorative Background Flare */}
                <div className="pointer-events-none absolute -bottom-6 -right-6 size-24 rounded-full bg-brand-500/5 blur-xl transition-opacity duration-300 group-hover:opacity-100 opacity-0" />
              </div>
            );
          }

          return (
            <div
              key={index}
              className="flex items-start gap-3 rounded-2xl border border-ink-200/90 bg-white p-4.5 shadow-xs"
            >
              <CheckmarkIcon />
              <div className="text-sm leading-relaxed text-ink-800 font-medium">
                <Inlines nodes={child.children as InlineNode[]} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // --- 3. Standard Unordered List: Premium Checkmark Feature Cards ---
  return (
    <ul className="my-5 space-y-3">
      {node.children.map((child, index) => {
        if (isListNode(child)) return <List key={index} node={child} nested />;
        return (
          <li
            key={index}
            className="group flex items-start gap-3.5 rounded-2xl border border-ink-200/90 bg-white p-4 sm:p-4.5 shadow-xs transition-all duration-200 hover:border-brand-300 hover:bg-brand-50/20 hover:shadow-xs"
          >
            <CheckmarkIcon />
            <div className="min-w-0 flex-1 text-sm sm:text-base leading-relaxed text-ink-800 font-medium">
              <Inlines nodes={child.children as InlineNode[]} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function CheckmarkIcon() {
  return (
    <span
      className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300/80 shadow-2xs"
      aria-hidden="true"
    >
      <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 8.5l3 3 6-6" />
      </svg>
    </span>
  );
}

function Inlines({ nodes }: { nodes: InlineNode[] }) {
  return (
    <>
      {nodes.map((node, index) => (
        <Inline key={index} node={node} />
      ))}
    </>
  );
}

const isInternal = (url: string) => url.startsWith('/') || url.startsWith(SITE_URL);

const LINK_CLASS =
  'font-bold text-brand-700 underline underline-offset-2 hover:text-brand-900 transition-colors';

function Inline({ node }: { node: InlineNode }) {
  if (node.type === 'link') {
    if (isInternal(node.url)) {
      return (
        <Link href={node.url} className={LINK_CLASS}>
          <Inlines nodes={node.children} />
        </Link>
      );
    }
    return (
      <a href={node.url} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
        <Inlines nodes={node.children} />
      </a>
    );
  }

  let element: ReactNode = node.text;
  if (node.code) {
    element = (
      <code className="rounded-md bg-brand-50 px-2 py-0.5 font-sans text-[0.9em] text-brand-900 border border-brand-200 font-semibold">
        {element}
      </code>
    );
  }
  if (node.bold) element = <strong className="font-extrabold text-ink-950">{element}</strong>;
  if (node.italic) element = <em>{element}</em>;
  if (node.underline) element = <u>{element}</u>;
  if (node.strikethrough) element = <s>{element}</s>;

  return <Fragment>{element}</Fragment>;
}
