import React from 'react';
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { COLORS } from './theme';
export default function SparkLine({
  data = [],
  width = 300,
  height = 120,
  color = COLORS.DARK_GREEN,
  showFill = false,
  markers = [],
}) {
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 20) - 10;
    return {
      x,
      y,
    };
  });
  const path = points.reduce((acc, p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = points[i - 1];
    const cx1 = prev.x + (p.x - prev.x) / 2;
    const cx2 = prev.x + (p.x - prev.x) / 2;
    return `${acc} C${cx1},${prev.y} ${cx2},${p.y} ${p.x},${p.y}`;
  }, '');
  const areaPath = `${path} L${width},${height} L0,${height} Z`;
  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.25" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </LinearGradient>
      </Defs>

      {showFill && <Path d={areaPath} fill="url(#grad)" />}
      <Path
        d={path}
        stroke={color}
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
      />

      {markers.map((m, i) => (
        <Circle
          key={i}
          cx={points[m.idx]?.x}
          cy={points[m.idx]?.y}
          r={5}
          fill={m.color}
          stroke="#FFFFFF"
          strokeWidth={2}
        />
      ))}
    </Svg>
  );
}
