import { Composition } from 'remotion';
import { FPS, Promo, TOTAL } from './Promo';

export const Root = () => (
	<Composition
		id="ValePromo"
		component={Promo}
		durationInFrames={TOTAL}
		fps={FPS}
		width={1920}
		height={1080}
	/>
);
