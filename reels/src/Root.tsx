import {Composition} from 'remotion';
import {Story, TOTAL} from './Story';

export const Root = () => (
  <Composition id="TeslaStory" component={Story} durationInFrames={TOTAL} fps={30} width={1080} height={1920} />
);
