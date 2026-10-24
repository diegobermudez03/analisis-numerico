import { Tex } from './Tex';

// Guía rápida de sintaxis del evaluador (cada ejemplo fue probado con mathjs).
const SECTIONS: { title: string; items: [string, string][]; note?: string }[] = [
  {
    title: 'Operaciones básicas',
    items: [
      ['x + 2', 'x + 2'],
      ['x - 2', 'x - 2'],
      ['3*x', '3x'],
      ['x/4', '\\frac{x}{4}'],
      ['(x+1)/(x-1)', '\\frac{x+1}{x-1}'],
    ],
    note: 'También vale 3x, pero es más seguro escribir *.',
  },
  {
    title: 'Potencias y raíces',
    items: [
      ['x^2', 'x^2'],
      ['x^(1/3)', 'x^{1/3}'],
      ['2^-x', '2^{-x}'],
      ['sqrt(x)', '\\sqrt{x}'],
      ['cbrt(x)', '\\sqrt[3]{x}'],
      ['nthRoot(x, 5)', '\\sqrt[5]{x}'],
    ],
    note: '-x^2 significa -(x²). Usa paréntesis en exponentes compuestos: x^(n+1).',
  },
  {
    title: 'Exponencial y logaritmos',
    items: [
      ['exp(x)', 'e^{x}'],
      ['e^x', 'e^{x}'],
      ['exp(-x^2)', 'e^{-x^2}'],
      ['ln(x)', '\\ln x'],
      ['log(x)', '\\ln x'],
      ['log10(x)', '\\log_{10} x'],
      ['log2(x)', '\\log_{2} x'],
      ['log(x, 3)', '\\log_{3} x'],
    ],
    note: 'Atención: log(x) es el logaritmo natural, igual que ln(x).',
  },
  {
    title: 'Trigonométricas (radianes)',
    items: [
      ['sin(x)', '\\sin x'],
      ['cos(x)', '\\cos x'],
      ['tan(x)', '\\tan x'],
      ['sec(x)', '\\sec x'],
      ['csc(x)', '\\csc x'],
      ['cot(x)', '\\cot x'],
      ['sin(x)^2', '\\sin^2 x'],
    ],
  },
  {
    title: 'Trigonométricas inversas e hiperbólicas',
    items: [
      ['asin(x)', '\\arcsin x'],
      ['acos(x)', '\\arccos x'],
      ['atan(x)', '\\arctan x'],
      ['sinh(x)', '\\sinh x'],
      ['cosh(x)', '\\cosh x'],
      ['tanh(x)', '\\tanh x'],
    ],
  },
  {
    title: 'Otros',
    items: [
      ['abs(x)', '|x|'],
      ['pi', '\\pi'],
      ['e', 'e'],
    ],
  },
  {
    title: 'Números en los campos',
    items: [
      ['pi/4', '\\pi/4'],
      ['1e-6', '10^{-6}'],
      ['10^-4', '10^{-4}'],
      ['1/3', '1/3'],
    ],
    note: 'Tolerancias, extremos y celdas de matrices aceptan estas expresiones.',
  },
];

export function ExpressionHelp() {
  return (
    <aside className="help">
      <div className="help-title">Cómo escribir expresiones</div>
      <p className="help-note">La variable siempre es <code>x</code>.</p>
      {SECTIONS.map((s) => (
        <section key={s.title} className="help-section">
          <div className="help-section-title">{s.title}</div>
          <table className="help-table">
            <tbody>
              {s.items.map(([code, tex]) => (
                <tr key={code}>
                  <td><code>{code}</code></td>
                  <td><Tex tex={tex} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {s.note && <p className="help-note">{s.note}</p>}
        </section>
      ))}
    </aside>
  );
}
