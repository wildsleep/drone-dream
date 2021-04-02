import React from 'react';
import { useSpring, a } from 'react-spring';
import * as animationConfig from 'Config/animationConfig.js';

export default function SettingsButton({ size, ...props }) {
	const [hover, setHover] = React.useState(false);

	const { transform } = useSpring({
		to: { transform: `rotate(${hover ? 120 : 0}deg)` },
		config: animationConfig.snappy
	});

	return (
		<button
			{...props}
			onMouseOver={() => { setHover(true); }}
			onMouseOut={() => { setHover(false); }}>
			<a.svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				width={size}
				height={size}
				style={{ transform }}>
				<path
					d="M5.334 4.545a9.99 9.99 0 0 1 3.542-2.048A3.993 3.993 0 0 0 12 3.999a3.993 3.993 0 0 0 3.124-1.502 9.99 9.99 0 0 1 3.542 2.048 3.993 3.993 0 0 0 .262 3.454 3.993 3.993 0 0 0 2.863 1.955 10.043 10.043 0 0 1 0 4.09c-1.16.178-2.23.86-2.863 1.955a3.993 3.993 0 0 0-.262 3.455 9.99 9.99 0 0 1-3.542 2.047A3.993 3.993 0 0 0 12 20a3.993 3.993 0 0 0-3.124 1.502 9.99 9.99 0 0 1-3.542-2.047 3.993 3.993 0 0 0-.262-3.455 3.993 3.993 0 0 0-2.863-1.954 10.043 10.043 0 0 1 0-4.091 3.993 3.993 0 0 0 2.863-1.955 3.993 3.993 0 0 0 .262-3.454zM13.5 14.597a3 3 0 1 0-3-5.196 3 3 0 0 0 3 5.196z"
					fill="currentColor" />
			</a.svg>
		</button>
	);
}