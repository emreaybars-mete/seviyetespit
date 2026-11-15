import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

const RED = '#e31937';
const FONT = 'Inter, "Helvetica Neue", Arial, sans-serif';

type Scene = {year: string; title: string; body: string; big?: string};

const scenes: Scene[] = [
  {year: '2003', title: 'Tesla kuruldu', body: 'Kurucuları Martin Eberhard ve Marc Tarpenning. Elon Musk henüz yok.'},
  {year: '2004', title: 'Musk giriyor', body: '6,5 milyon dolarlık yatırımla en büyük ortak ve yönetim kurulu başkanı oldu.', big: '$6,5M'},
  {year: '2008', title: 'İflasın eşiği', body: 'Roadster gecikti, para bitti. Musk CEO oldu. Noel arifesinde son anda finansman bulundu.'},
  {year: '2010', title: 'Halka arz', body: 'Hisse 17 dolardan işlem görmeye başladı.', big: '$17'},
  {year: '2012', title: 'Model S', body: 'Elektrikli arabaların ciddi bir rakip olabileceğini gösterdi.'},
  {year: '2017', title: 'Üretim cehennemi', body: 'Model 3 için üretim hedeflerinin çok gerisinde kalındı. Musk fabrikada uyudu.'},
  {year: '2021', title: '1 trilyon dolar', body: 'Tesla piyasa değeri 1 trilyon doları aştı.', big: '$1T'},
];

const SCENE = 150;
const INTRO = 90;
const OUTRO = 90;
export const TOTAL = INTRO + scenes.length * SCENE + OUTRO;

const Bg = () => {
  const f = useCurrentFrame();
  const x = interpolate(f, [0, TOTAL], [-200, 200]);
  return (
    <AbsoluteFill style={{background: '#0b0b0d'}}>
      <div style={{position: 'absolute', width: 1400, height: 1400, borderRadius: '50%', left: -160 + x, top: 200,
        background: `radial-gradient(circle, ${RED}33, transparent 60%)`}} />
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

const Intro = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f, fps, config: {damping: 14}});
  const o = interpolate(f, [70, 90], [1, 0]);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: o, fontFamily: FONT}}>
      <div style={{fontSize: 330, fontWeight: 900, color: RED, transform: `scale(${s})`}}>T</div>
      <div style={{fontSize: 80, fontWeight: 800, color: '#fff', marginTop: 20, opacity: s}}>Tesla'nın hikâyesi</div>
      <div style={{fontSize: 44, color: '#ffffff99', marginTop: 16, opacity: s}}>Musk'tan önce ve sonra</div>
    </AbsoluteFill>
  );
};

const Card = ({scene, i}: {scene: Scene; i: number}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const yearIn = spring({frame: f, fps, config: {damping: 16}});
  const titleIn = spring({frame: f - 8, fps, config: {damping: 16}});
  const bodyIn = spring({frame: f - 20, fps, config: {damping: 20}});
  const out = interpolate(f, [SCENE - 12, SCENE], [1, 0], {extrapolateLeft: 'clamp'});
  const bigScale = spring({frame: f - 30, fps, config: {damping: 10}});
  return (
    <AbsoluteFill style={{padding: '0 80px', justifyContent: 'center', fontFamily: FONT, opacity: out}}>
      <div style={{fontSize: 260, fontWeight: 900, color: RED, lineHeight: 1,
        transform: `translateY(${(1 - yearIn) * 120}px)`, opacity: yearIn}}>{scene.year}</div>
      <div style={{fontSize: 100, fontWeight: 800, color: '#fff', marginTop: 20,
        transform: `translateY(${(1 - titleIn) * 80}px)`, opacity: Math.max(0, titleIn)}}>{scene.title}</div>
      <div style={{fontSize: 52, lineHeight: 1.35, color: '#ffffffcc', marginTop: 36,
        transform: `translateY(${(1 - bodyIn) * 50}px)`, opacity: Math.max(0, bodyIn)}}>{scene.body}</div>
      {scene.big && (
        <div style={{fontSize: 200, fontWeight: 900, color: '#fff', marginTop: 70,
          transform: `scale(${Math.max(0, bigScale)})`, transformOrigin: 'left center'}}>{scene.big}</div>
      )}
      <div style={{position: 'absolute', bottom: 120, left: 80, fontSize: 36, color: '#ffffff66'}}>{i + 1} / {scenes.length}</div>
    </AbsoluteFill>
  );
};

const Outro = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f, fps, config: {damping: 14}});
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily: FONT, textAlign: 'center', padding: 80}}>
      <div style={{fontSize: 90, fontWeight: 900, color: '#fff', transform: `scale(${s})`}}>Pes etmeyen kazanır mı?</div>
      <div style={{fontSize: 48, color: '#ffffffaa', marginTop: 30, opacity: s}}>Düşüncen yorumlarda</div>
    </AbsoluteFill>
  );
};

export const Story = () => (
  <AbsoluteFill>
    <Bg />
    <Progress />
    <Sequence from={0} durationInFrames={INTRO}><Intro /></Sequence>
    {scenes.map((s, i) => (
      <Sequence key={s.year} from={INTRO + i * SCENE} durationInFrames={SCENE}><Card scene={s} i={i} /></Sequence>
    ))}
    <Sequence from={INTRO + scenes.length * SCENE} durationInFrames={OUTRO}><Outro /></Sequence>
  </AbsoluteFill>
);
