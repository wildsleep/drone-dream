import React from 'react';
import { useSpring, a } from 'react-spring';
import { usePrevious } from 'react-use';
import { interpolate } from 'flubber';
import * as animationConfig from 'Config/animationConfig.js';

const playPath = 'M19.376 12.416L8.777 19.482A.5.5 0 0 1 8 19.066V4.934a.5.5 0 0 1 .777-.416l10.599 7.066a.5.5 0 0 1 0 .832z';
const stopPath = 'M6 5h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z';
const tPlay = 0;
const tStop = 1;
const interpolator = interpolate(playPath, stopPath, { maxSegmentLength: 0.1 });

export default function PlayStopButton({ size, playing, ...props }) {
	const previousPlaying = usePrevious(playing);
	const [hover, setHover] = React.useState(false);

	const playStopSpring = useSpring({
		from: {
			t: playing ? tPlay : tStop,
			transform: `rotate(${playing ? 0 : -90}deg`
		},
		to: {
			t: playing ? tStop : tPlay,
			transform: `rotate(${playing ? 90 : 0}deg)`
		},
		immediate: previousPlaying == null,
		reset: previousPlaying !== playing,
		config: animationConfig.snappy
	});

	const hoverSpring = useSpring({
		to: {
			transform: `scale(${hover ? 1.15 : 1})`
		},
		config: animationConfig.snappy
	});

	return (
		<button
			{...props}
			onMouseOver={() => { setHover(true); }}
			onMouseOut={() => { setHover(false); }}>
			<a.div style={{ transform: hoverSpring.transform }}>
				<a.svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					width={size}
					height={size}
					style={{ transform: playStopSpring.transform }}>
					<a.path
						d={playStopSpring.t.interpolate(interpolator)}
						fill="currentColor" />
				</a.svg>
			</a.div>
		</button>
	);
}
