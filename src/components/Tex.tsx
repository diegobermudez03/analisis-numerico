import katex from 'katex';
import { Fragment, useMemo } from 'react';

export function Tex({ tex, block = false }: { tex: string; block?: boolean }) {
  const html = useMemo(() => katex.renderToString(tex, { displayMode: block, throwOnError: false }), [tex, block]);
  return <span className={block ? 'tex-block' : 'tex'} dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Texto con fórmulas en línea entre $...$ y negritas entre **...**. */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/(\$[^$]+\$|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('$') && p.endsWith('$') && p.length > 1 ? (
          <Tex key={i} tex={p.slice(1, -1)} />
        ) : p.startsWith('**') && p.endsWith('**') && p.length > 3 ? (
          <strong key={i}>{p.slice(2, -2)}</strong>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}
