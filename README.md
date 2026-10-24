# App de Análisis Numérico

Aplicación local (React + TypeScript + Vite) para presentar en clase las 14 tareas del curso,
mostrando el paso a paso completo de cada método. Ver `Especificacion_App_Analisis_Numerico.docx`.

## Uso

```bash
npm install      # solo la primera vez
npm run dev      # abre http://localhost:5173
```

Para la presentación sin depender de nada externo: `npm run build` y luego `npm run preview`
(o abrir `dist/` con cualquier servidor estático). Todo el cálculo ocurre en el navegador.

## Estructura

- `src/algorithms/`: **un archivo por algoritmo** (14). Cada función solo recibe la entrada y
  devuelve la salida (resultado, motivo de parada e iteraciones/operaciones realizadas).
  No contiene nada de interfaz: es el código a sustentar.
  Todo está escrito en español (funciones, variables, tipos y códigos de parada).
  - `biseccion.ts`, `punto-fijo.ts`, `posicion-falsa.ts`, `newton-raphson.ts`, `secante.ts`
  - `sustitucion-atras.ts`, `factorizacion-lu.ts`, `sustitucion-adelante.ts`, `solucion-lu.ts`, `lup.ts`, `jacobi.ts`
  - `sumas-inferiores-superiores.ts`, `trapecio.ts`, `simpson.ts`
- `src/presentation/`: convierte la salida de cada algoritmo en el paso a paso (fórmulas, tablas, matrices).
- `src/tasks.ts`: las 14 tareas (entradas, ejemplo precargado, validaciones del formulario).
- `src/lib/`: evaluador de expresiones (`x^2 - 3*x + sin(x)`, `ln(x)`, `pi`, ...), formato de números y tipos.
- `src/components/`, `src/App.tsx`: interfaz (React + KaTeX).
