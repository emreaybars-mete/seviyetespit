// Side-profile car silhouettes (facing left), drawn in a 600×200 box. Ground at y=170.
export type CarKey = 'roadster' | 'modelS' | 'modelX' | 'model3' | 'modelY' | 'cybertruck';

type Shape = {
  noseY: number; hoodY: number; ws: number; belt: number;
  roofY: number; r1: number; r2: number; tail: number; tailY: number;
  wheels: [number, number]; r: number;
};

const SHAPES: Record<Exclude<CarKey, 'cybertruck'>, Shape> = {
  roadster: {noseY: 128, hoodY: 116, ws: 235, belt: 108, roofY: 78, r1: 300, r2: 350, tail: 470, tailY: 102, wheels: [118, 478], r: 31},
  modelS: {noseY: 122, hoodY: 106, ws: 200, belt: 100, roofY: 54, r1: 275, r2: 375, tail: 525, tailY: 94, wheels: [120, 475], r: 33},
  modelX: {noseY: 116, hoodY: 98, ws: 190, belt: 94, roofY: 36, r1: 262, r2: 430, tail: 545, tailY: 80, wheels: [122, 478], r: 36},
  model3: {noseY: 124, hoodY: 108, ws: 210, belt: 102, roofY: 58, r1: 275, r2: 360, tail: 515, tailY: 96, wheels: [125, 465], r: 32},
  modelY: {noseY: 118, hoodY: 101, ws: 198, belt: 97, roofY: 44, r1: 268, r2: 400, tail: 538, tailY: 86, wheels: [125, 470], r: 35},
};

const body = (s: Shape) =>
  `M20,150 L20,${s.noseY} Q22,${s.hoodY} 70,${s.hoodY} L${s.ws},${s.belt} ` +
  `Q${s.ws + 32},${s.roofY} ${s.r1},${s.roofY} L${s.r2},${s.roofY} ` +
  `Q${s.tail - 40},${s.roofY + 4} ${s.tail},${s.tailY} Q575,${s.tailY + 2} 580,${s.tailY + 16} L580,150 Z`;

const glass = (s: Shape) =>
  `M${s.ws + 14},${s.belt - 3} Q${s.ws + 38},${s.roofY + 9} ${s.r1 + 4},${s.roofY + 9} ` +
  `L${s.r2 - 4},${s.roofY + 9} Q${s.tail - 55},${s.roofY + 12} ${s.tail - 30},${s.belt - 3} Z`;

const Wheel = ({x, r, rot, bg}: {x: number; r: number; rot: number; bg: string}) => (
  <g transform={`translate(${x},${170 - r})`}>
    <circle r={r + 7} fill={bg} />
    <circle r={r} fill="#111" stroke="#2a2a2e" strokeWidth={3} />
    <g transform={`rotate(${rot})`}>
      <circle r={r * 0.62} fill="#7d828a" />
      {[0, 72, 144, 216, 288].map((a) => (
        <rect key={a} x={-3} y={-r * 0.6} width={6} height={r * 0.6} fill="#3a3d42" transform={`rotate(${a})`} />
      ))}
      <circle r={r * 0.16} fill="#222" />
    </g>
  </g>
);

export const Car = ({kind, color, rot, bg, width}: {kind: CarKey; color: string; rot: number; bg: string; width: number}) => {
  const id = `g-${kind}`;
  const defs = (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={color} />
        <stop offset="1" stopColor={color} stopOpacity={0.55} />
      </linearGradient>
      <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#3b4552" />
        <stop offset="1" stopColor="#0d1117" />
      </linearGradient>
    </defs>
  );
  const shadow = <ellipse cx={300} cy={172} rx={270} ry={9} fill="#000" opacity={0.6} />;

  if (kind === 'cybertruck') {
    return (
      <svg viewBox="0 0 600 200" width={width} style={{overflow: 'visible'}}>
        {defs}
        {shadow}
        <path d="M18,148 L18,108 L292,52 L582,92 L582,148 Z" fill={`url(#${id})`} stroke="#d9dde2" strokeWidth={2} />
        <path d="M150,96 L290,64 L420,82 L420,96 Z" fill="url(#glass)" />
        <rect x={18} y={104} width={130} height={4} fill="#fff" />
        <rect x={562} y={96} width={20} height={5} fill="#ff2a3a" />
        <line x1={18} y1={122} x2={582} y2={122} stroke="#00000033" strokeWidth={2} />
        <Wheel x={125} r={38} rot={rot} bg={bg} />
        <Wheel x={480} r={38} rot={rot} bg={bg} />
      </svg>
    );
  }

  const s = SHAPES[kind];
  return (
    <svg viewBox="0 0 600 200" width={width} style={{overflow: 'visible'}}>
      {defs}
      {shadow}
      <path d={body(s)} fill={`url(#${id})`} />
      <path d={glass(s)} fill="url(#glass)" />
      <path d={`M${s.ws},${s.belt + 14} L${s.tail},${s.tailY + 18}`} stroke="#ffffff30" strokeWidth={2} />
      <path d={`M22,${s.noseY + 2} Q40,${s.hoodY + 4} 75,${s.hoodY + 6}`} stroke="#fff" strokeWidth={5} strokeLinecap="round" fill="none" />
      <rect x={566} y={s.tailY + 18} width={14} height={8} rx={2} fill="#ff2a3a" />
      <Wheel x={s.wheels[0]} r={s.r} rot={rot} bg={bg} />
      <Wheel x={s.wheels[1]} r={s.r} rot={rot} bg={bg} />
    </svg>
  );
};
