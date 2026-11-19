import { Composition } from 'remotion';
import { FPS, LOOPS, Loop, Promo, TOTAL } from './Promo';

export const Root = () => (
	<>
		<Composition
			id="ValePromo"
			component={Promo}
			durationInFrames={TOTAL}
			fps={FPS}
			width={1920}
			height={1080}
		/>
		{Object.entries(LOOPS).map(([id, scene]) => (
			<Composition
				key={id}
				id={id}
				component={Loop}
				defaultProps={{ id }}
				durationInFrames={Math.round(scene.seconds * FPS)}
				fps={FPS}
				width={1280}
				height={720}
			/>
		))}
	</>
);
