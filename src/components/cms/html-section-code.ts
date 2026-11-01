import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';
import valueParser from 'postcss-value-parser';
import sanitizeHtml from 'sanitize-html';
import sourcePolicy from '../../config/source-link-policy.json';

const ROOT_ATTRIBUTE = 'data-rs-html-root';
const BODY_ATTRIBUTE = 'data-rs-html-body';

const allowedTags = [...sanitizeHtml.defaults.allowedTags,
  'div', 'span', 'section', 'article', 'header', 'footer', 'main', 'aside', 'nav',
  'figure', 'figcaption', 'picture', 'source', 'img', 'button', 'details', 'summary',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'col', 'colgroup', 'time', 'small',
  'form', 'label', 'input', 'select', 'option', 'optgroup', 'textarea', 'fieldset', 'legend',
  'progress', 'meter'];

const attributes: sanitizeHtml.IOptions['allowedAttributes'] = {
  '*': ['class', 'id', 'title', 'role', 'aria-*', 'data-*', 'style', 'lang', 'dir', 'tabindex'],
  a: ['href', 'target', 'rel', 'class', 'id', 'title', 'aria-*', 'data-*', 'style'],
  img: ['src', 'srcset', 'sizes', 'alt', 'width', 'height', 'loading', 'class', 'style'],
  source: ['src', 'srcset', 'sizes', 'type', 'media'],
  time: ['datetime', 'class'],
  label: ['for', 'class', 'id', 'style'],
  input: ['type', 'value', 'placeholder', 'checked', 'disabled', 'readonly', 'min', 'max', 'step', 'size', 'class', 'id', 'style', 'aria-*'],
  button: ['type', 'disabled', 'class', 'id', 'style', 'aria-*'],
  select: ['multiple', 'size', 'disabled', 'class', 'id', 'style', 'aria-*'],
  option: ['value', 'selected', 'disabled', 'label', 'class'],
  optgroup: ['label', 'disabled'],
  textarea: ['rows', 'cols', 'placeholder', 'disabled', 'readonly', 'class', 'id', 'style', 'aria-*'],
  fieldset: ['disabled', 'class', 'id', 'style', 'aria-*'],
  th: ['colspan', 'rowspan', 'scope', 'headers', 'abbr', 'class', 'id', 'style'],
  td: ['colspan', 'rowspan', 'headers', 'class', 'id', 'style'],
  col: ['span', 'class', 'style'],
  colgroup: ['span', 'class', 'style'],
  ol: ['start', 'reversed', 'type', 'class', 'style'],
  li: ['value', 'class', 'style'],
  details: ['open', 'name', 'class', 'id', 'style'],
  progress: ['value', 'max', 'class', 'id', 'style'],
  meter: ['value', 'min', 'max', 'low', 'high', 'optimum', 'class', 'id', 'style'],
};

const escapeAttribute = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Keep controls as disabled layout examples. Submission must use a platform form. */
export function sanitizeSectionMarkup(html: string) {
  let rootAttributes: Record<string, string> = {};
  let bodyAttributes: Record<string, string> = {};
  const options: sanitizeHtml.IOptions = {
    allowedTags,
    allowedAttributes: attributes,
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowProtocolRelative: false,
    nonTextTags: ['script', 'style', 'head', 'title', 'iframe', 'object', 'embed', 'noscript', 'template'],
    transformTags: {
      html: (tagName, attribs) => { rootAttributes = attribs; return { tagName, attribs: {} }; },
      body: (tagName, attribs) => { bodyAttributes = attribs; return { tagName, attribs: {} }; },
      form: (_tagName, attribs) => ({ tagName: 'div', attribs: { ...attribs, role: 'group', 'data-rs-static-form': 'true' } }),
      a: (tagName, attribs): { tagName: string; attribs: Record<string, string> } => {
        try { const host = new URL(attribs.href).hostname.toLowerCase().replace(/^www\./, ''); if (sourcePolicy.disabled_hosts.some(entry => host === entry.hostname || host.endsWith('.' + entry.hostname))) return { tagName: 'span', attribs: { title: 'Historical source link disabled after a domain change' } }; } catch {}
        return { tagName, attribs: { ...attribs, ...(attribs.target === '_blank' ? { rel: 'noopener noreferrer' } : {}) } };
      },
      button: (tagName, attribs) => ({ tagName, attribs: { ...attribs, type: 'button', disabled: '' } }),
      input: (tagName, attribs) => ({ tagName, attribs: { ...attribs, disabled: '' } }),
      select: (tagName, attribs) => ({ tagName, attribs: { ...attribs, disabled: '' } }),
      textarea: (tagName, attribs) => ({ tagName, attribs: { ...attribs, disabled: '' } }),
    },
  };
  const content = sanitizeHtml(html, options);
  const wrapDocumentElement = (marker: string, attribs: Record<string, string>, body: string) => {
    const sourceAttributes = ['class', 'id', 'title', 'style', 'lang', 'dir']
      .filter((name) => attribs[name])
      .map((name) => `${name}="${escapeAttribute(attribs[name])}"`).join(' ');
    const shell = sanitizeHtml(`<div ${marker}="true" ${sourceAttributes}></div>`, options);
    return shell.replace(/<\/div>$/, body + '</div>');
  };
  return wrapDocumentElement(ROOT_ATTRIBUTE, rootAttributes,
    wrapDocumentElement(BODY_ATTRIBUTE, bodyAttributes, content));
}

/** Scope authored document selectors and animation names to this content block. */
export function scopeSectionCss(css: string, scopeId: string) {
  const scope = `[data-rs-html-section="${scopeId}"]`;
  const documentRoot = `${scope} [${ROOT_ATTRIBUTE}]`;
  try {
    const root = postcss.parse(css.replace(/<\/style/gi, ''));
    const animationNames = new Map<string, string>();
    root.walkAtRules((rule) => {
      const name = rule.name.toLowerCase();
      if (/^(?:-\w+-)?keyframes$/.test(name)) {
        const parsed = valueParser(rule.params);
        const token = parsed.nodes.find((node) => node.type === 'word' || node.type === 'string');
        if (token && (token.type === 'word' || token.type === 'string')) {
          const replacement = `${scopeId}-${token.value}`;
          animationNames.set(token.value, replacement);
          token.value = replacement;
          rule.params = parsed.toString();
        }
      } else if (name === 'layer') {
        if (rule.nodes) rule.replaceWith(rule.nodes);
        else rule.remove();
      } else if (!['media', 'supports', 'container', 'starting-style'].includes(name)) {
        // Global font/property/page registrations cannot be scoped to a block.
        rule.remove();
      }
    });
    root.walkDecls((declaration) => {
      if (!/^(?:-\w+-)?animation(?:-name)?$/i.test(declaration.prop)) return;
      const parsed = valueParser(declaration.value);
      parsed.walk((node) => {
        if ((node.type === 'word' || node.type === 'string') && animationNames.has(node.value)) {
          node.value = animationNames.get(node.value)!;
        }
      });
      declaration.value = parsed.toString();
    });
    root.walkRules((rule) => {
      if (rule.parent?.type === 'atrule' && /keyframes$/i.test(rule.parent.name)) return;
      // Native nested selectors inherit the scoped outer rule. Prefixing them
      // again would turn `.card { &:hover {} }` into an unmatched selector.
      let ancestor = rule.parent;
      while (ancestor && ancestor.type !== 'root') {
        if (ancestor.type === 'rule') return;
        ancestor = ancestor.parent;
      }
      rule.selector = selectorParser((selectors) => {
        selectors.each((selector) => {
          selector.walkTags((tag) => {
            if (tag.value.toLowerCase() === 'html') tag.replaceWith(...selectorParser().astSync(documentRoot).nodes[0].nodes.map((node) => node.clone()));
            else if (tag.value.toLowerCase() === 'body') tag.replaceWith(selectorParser().astSync(`[${BODY_ATTRIBUTE}]`).nodes[0].nodes[0].clone());
          });
          selector.walkPseudos((pseudo) => {
            if (pseudo.value === ':root' || pseudo.value === ':host') {
              pseudo.replaceWith(...selectorParser().astSync(documentRoot).nodes[0].nodes.map((node) => node.clone()));
            }
          });
          if (!selector.toString().trim().startsWith(scope)) {
            selector.prepend(selectorParser.combinator({ value: ' ' }));
            selector.prepend(selectorParser().astSync(scope).nodes[0].nodes[0].clone());
          }
        });
      }).processSync(rule.selector);
    });
    return root.toString();
  } catch {
    return '';
  }
}

export function htmlSectionScopeId(id: number | string, html: string, css: string) {
  let hash = 2166136261;
  const value = html + css;
  for (let index = 0; index < value.length; index++) hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  return `rs-html-${String(id).replace(/[^a-z0-9_-]/gi, '')}-${(hash >>> 0).toString(36)}`;
}
