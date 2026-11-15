import {AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Car, CarKey} from './Car';
import script from './script.json';
import durations from './durations.json';

const RED = '#e31937';
const BG = '#0b0b0d';
const FONT = 'Inter, "Helvetica Neue", Arial, sans-serif';
const LEAD = 12;

type SceneData = (typeof script.scenes)[number] & {
  car?: string; color?: string; year?: string; name?: string;
  value?: number; unit?: string; label?: string; chips?: string[];
};
const scenes = script.scenes as SceneData[];
const dur = durations as Record<string, number>;

const starts: number[] = [];
scenes.reduce((acc, s) => (starts.push(acc), acc + dur[s.id]), 0);
export const TOTAL = scenes.reduce((a, s) => a + dur[s.id], 0);

const fmt = (n: number) => Math.round(n).toLocaleString('tr-TR');
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ---------- shared pieces ----------
const Bg = () => {
  const f = useCurrentFrame();
  const x = interpolate(f, [0, TOTAL], [-250, 250]);
  return (
    <AbsoluteFill style={{background: BG}}>
      <div style={{position: 'absolute', width: 1500, height: 1500, borderRadius: '50%', left: -210 + x, top: 250,
        background: `radial-gradient(circle, ${RED}2e, transparent 60%)`}} />
    </AbsoluteFill>
  );
};

const Progress = () => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', top: 60, left: 60, right: 60, height: 8, background: '#ffffff22', borderRadius: 4}}>
      <div style={{height: '100%', width: `${(f / TOTAL) * 100}%`, background: RED, borderRadius: 4}} />
    </div>
  );
};

const Road = ({offset, y}: {offset: number; y: number}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, height: 6, overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: -200 + (((-offset % 200) + 200) % 200) - 200, width: 1600, height: 6,
      backgroundImage: 'repeating-linear-gradient(90deg, #ffffff55 0 100px, transparent 100px 200px)'}} />
  </div>
);

const fadeInOut = (f: number, d: number) =>
  interpolate(f, [0, 8, d - 12, d], [0, 1, 1, 0], clamp);

// ---------- scenes ----------
const Intro = ({d}: {d: number}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const carX = interpolate(f, [30, 110], [-1300, 1400], {...clamp, easing: Easing.inOut(Easing.cubic)});
  return (
    <AbsoluteFill style={{fontFamily: FONT, opacity: fadeInOut(f, d), alignItems: 'center'}}>
      <div style={{display: 'flex', marginTop: 520}}>
        {'TESLA'.split('').map((c, i) => {
          const s = spring({frame: f - i * 4, fps, config: {damping: 12}});
          return <div key={i} style={{fontSize: 230, fontWeight: 900, color: '#fff', letterSpacing: 18,
            transform: `translateY(${(1 - s) * -200}px)`, opacity: s}}>{c}</div>;
        })}
      </div>
      <div style={{fontSize: 56, color: '#ffffffb0', marginTop: 10,
        opacity: interpolate(f, [25, 40], [0, 1], clamp)}}>Roadster'dan Cybertruck'a</div>
      <div style={{position: 'absolute', top: 1180, left: 60 + carX}}>
        <Car kind="modelS" color={RED} rot={carX * 0.35} bg={BG} width={960} />
      </div>
      <Road offset={f * 22} y={1340} />
    </AbsoluteFill>
  );
};

const CarScene = ({s, d}: {s: SceneData; d: number}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame: f, fps, config: {damping: 15, mass: 1.2}});
  const exit = interpolate(f, [d - 22, d], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const carX = (1 - enter) * -1300 + exit * 1500;
  const bob = Math.sin(f / 3) * (1 - enter) * 6;

  const yearIn = spring({frame: f - 4, fps, config: {damping: 14}});
  const nameIn = spring({frame: f - 10, fps, config: {damping: 14}});
  const statIn = spring({frame: f - 24, fps, config: {damping: 16}});
  const count = interpolate(f, [26, 70], [0, s.value ?? 0], {...clamp, easing: Easing.out(Easing.cubic)});
  const textOut = interpolate(f, [d - 14, d], [1, 0], clamp);

  return (
    <AbsoluteFill style={{fontFamily: FONT}}>
      <div style={{position: 'absolute', top: 190, left: 80, right: 80, opacity: textOut}}>
        <div style={{fontSize: 220, fontWeight: 900, color: RED, lineHeight: 1,
          transform: `translateX(${(1 - yearIn) * -300}px)`, opacity: yearIn}}>{s.year}</div>
        <div style={{fontSize: 120, fontWeight: 800, color: '#fff', marginTop: 10,
          transform: `translateX(${(1 - nameIn) * -300}px)`, opacity: Math.max(0, nameIn)}}>{s.name}</div>
      </div>

      <div style={{position: 'absolute', top: 760 + bob, left: 60 + carX}}>
        <Car kind={s.car as CarKey} color={s.color!} rot={carX * 0.35} bg={BG} width={960} />
      </div>
      <Road offset={carX * 1.2 + f * 2} y={1100} />

      <div style={{position: 'absolute', top: 1190, left: 80, right: 80, opacity: textOut,
        transform: `translateY(${(1 - statIn) * 80}px)`}}>
        {s.value ? (
          <>
            <div style={{fontSize: 150, fontWeight: 900, color: '#fff', lineHeight: 1, opacity: Math.max(0, statIn)}}>
              {s.value >= 1_000_000 ? `≈${(count / 1_000_000).toLocaleString('tr-TR', {maximumFractionDigits: 1, minimumFractionDigits: 1})} milyon` : fmt(count)}
              <span style={{fontSize: 56, fontWeight: 600, color: '#ffffff99', marginLeft: 20}}>{s.value < 1_000_000 ? s.unit : ''}</span>
            </div>
            <div style={{fontSize: 44, color: '#ffffffaa', marginTop: 14, opacity: Math.max(0, statIn)}}>{s.label}</div>
          </>
        ) : null}
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 18, marginTop: 50}}>
          {s.chips?.map((c, i) => {
            const p = spring({frame: f - 40 - i * 7, fps, config: {damping: 14}});
            return <div key={c} style={{fontSize: 40, color: '#fff', padding: '14px 28px', borderRadius: 999,
              border: `2px solid ${RED}`, background: '#ffffff0d', transform: `scale(${p})`, opacity: p}}>{c}</div>;
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const short = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toLocaleString('tr-TR', {maximumFractionDigits: 2})} mn` : `${Math.round(v / 1000)} bin`;

const Chart = ({d}: {d: number}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const data = script.deliveries as [number, number][];
  const max = 1_900_000;
  const H = 900, W = 920, gap = 14;
  const bw = (W - gap * (data.length - 1)) / data.length;
  const lastIdx = data.reduce((m, _, i) => (f >= 20 + i * 9 ? i : m), 0);
  const head = spring({frame: f, fps, config: {damping: 14}});
  return (
    <AbsoluteFill style={{fontFamily: FONT, opacity: fadeInOut(f, d)}}>
      <div style={{position: 'absolute', top: 190, left: 80, right: 80, transform: `translateY(${(1 - head) * -80}px)`, opacity: head}}>
        <div style={{fontSize: 100, fontWeight: 900, color: '#fff'}}>Yıllık teslimat</div>
        <div style={{fontSize: 44, color: '#ffffffaa', marginTop: 8}}>Tesla, tüm modeller · 2012–2024</div>
        <div style={{fontSize: 130, fontWeight: 900, color: RED, marginTop: 30}}>{fmt(data[lastIdx][1])}</div>
        <div style={{fontSize: 44, color: '#ffffffaa'}}>{data[lastIdx][0]} yılında</div>
      </div>
      <div style={{position: 'absolute', left: 80, top: 1650 - H, width: W, height: H}}>
        {data.map(([year, v], i) => {
          const g = spring({frame: f - 20 - i * 9, fps, config: {damping: 18}});
          const h = (v / max) * H * Math.max(0, g);
          const peak = year === 2023;
          const showLabel = [2012, 2018, 2020, 2021, 2022, 2023].includes(year);
          return (
            <div key={year} style={{position: 'absolute', bottom: 0, left: i * (bw + gap), width: bw}}>
              <div style={{position: 'absolute', bottom: h + 12, width: bw + 40, left: -20, textAlign: 'center',
                fontSize: 28, fontWeight: 700, color: peak ? RED : '#ffffffcc', opacity: showLabel && g > 0.5 ? 1 : 0}}>{short(v)}</div>
              <div style={{height: h, background: peak ? RED : '#ffffffd0', borderRadius: '10px 10px 0 0'}} />
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 80, top: 1670, width: W}}>
        {data.map(([year], i) => (
          <div key={year} style={{position: 'absolute', left: i * (bw + gap), width: bw, textAlign: 'center',
            fontSize: 28, color: '#ffffff88'}}>'{String(year).slice(2)}</div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 80, top: 1740, fontSize: 28, color: '#ffffff55'}}>Kaynak: Tesla yıllık teslimat raporları</div>
    </AbsoluteFill>
  );
};

const LINEUP: [CarKey, string][] = [
  ['roadster', '#e31937'], ['modelS', '#c9ccd1'], ['modelX', '#2b5cff'],
  ['model3', '#f2f2f2'], ['modelY', '#8a1020'], ['cybertruck', '#a7adb4'],
];

const Outro = ({d}: {d: number}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = spring({frame: f - 30, fps, config: {damping: 14}});
  return (
    <AbsoluteFill style={{fontFamily: FONT, opacity: interpolate(f, [0, 8], [0, 1], clamp)}}>
      {LINEUP.map(([k, c], i) => {
        const p = spring({frame: f - i * 4, fps, config: {damping: 14}});
        const col = i % 2, row = Math.floor(i / 2);
        return (
          <div key={k} style={{position: 'absolute', left: 60 + col * 500 + (1 - p) * (col ? 600 : -600), top: 230 + row * 240}}>
            <Car kind={k} color={c} rot={(1 - p) * 300} bg={BG} width={460} />
          </div>
        );
      })}
      <div style={{position: 'absolute', top: 1080, left: 80, right: 80, textAlign: 'center',
        transform: `scale(${t})`, opacity: Math.max(0, t)}}>
        <div style={{fontSize: 92, fontWeight: 900, color: '#fff', lineHeight: 1.15}}>Sence en önemli model hangisi?</div>
        <div style={{fontSize: 52, color: RED, marginTop: 40, fontWeight: 700}}>Yorumlara yaz 👇</div>
      </div>
    </AbsoluteFill>
  );
};

export const Story = () => (
  <AbsoluteFill>
    <Bg />
    {scenes.map((s, i) => {
      const d = dur[s.id];
      return (
        <Sequence key={s.id} from={starts[i]} durationInFrames={d}>
          <Sequence from={LEAD}><Audio src={staticFile(`vo/${s.id}.wav`)} /></Sequence>
          {s.type === 'intro' && <Intro d={d} />}
          {s.type === 'car' && <CarScene s={s} d={d} />}
          {s.type === 'chart' && <Chart d={d} />}
          {s.type === 'outro' && <Outro d={d} />}
        </Sequence>
      );
    })}
    <Progress />
  </AbsoluteFill>
);
