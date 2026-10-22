import React from 'react';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';

/*
 * Illustrated weather icons drawn in SVG (100 x 100 artboard), so they
 * stay sharp at any size and need no image files.
 *
 * kind: sun | moon | sunCloud | moonCloud | cloud | rain | storm |
 *       fog | wind | snow
 * hideDrops: leave out the rain drops (AnimatedWeatherArt draws its own)
 */

// Fluffy cloud outline (about x 10-90, y 40-80)
const CLOUD =
  'M28 80 C14 80 8 70 10 62 C12 53 20 48 28 49 C30 38 40 31 51 32 C62 33 70 41 72 51 C82 50 90 57 90 66 C90 74 84 80 76 80 Z';

function Sun({ cx = 50, cy = 50, r = 22, id }) {
  const rays = Array.from({ length: 8 }, (_, index) => {
    const angle = (index * Math.PI) / 4;
    return {
      x1: cx + Math.cos(angle) * (r + 6),
      y1: cy + Math.sin(angle) * (r + 6),
      x2: cx + Math.cos(angle) * (r + 14),
      y2: cy + Math.sin(angle) * (r + 14),
    };
  });

  return (
    <G>
      {rays.map((ray, index) => (
        <Line
          key={index}
          {...ray}
          stroke="#FBBF24"
          strokeWidth={5}
          strokeLinecap="round"
        />
      ))}
      <Circle cx={cx} cy={cy} r={r} fill={`url(#${id}sun)`} />
      <Circle
        cx={cx - r * 0.3}
        cy={cy - r * 0.3}
        r={r * 0.35}
        fill="#FFF7D6"
        opacity={0.45}
      />
    </G>
  );
}

function Moon({ cx = 50, cy = 46, r = 24, id }) {
  return (
    <G>
      <Path
        d={`M${cx + r * 0.2} ${cy - r} A${r} ${r} 0 1 0 ${cx + r} ${
          cy + r * 0.35
        } A${r * 0.85} ${r * 0.85} 0 0 1 ${cx + r * 0.2} ${cy - r} Z`}
        fill={`url(#${id}moon)`}
      />
      <Circle
        cx={cx - r * 0.35}
        cy={cy + r * 0.1}
        r={3}
        fill="#C7D2FE"
        opacity={0.7}
      />
      <Circle
        cx={cx - r * 0.05}
        cy={cy + r * 0.55}
        r={2.2}
        fill="#C7D2FE"
        opacity={0.7}
      />
    </G>
  );
}

function Stars() {
  return (
    <G fill="#FDE68A">
      <Circle cx={16} cy={22} r={2.2} />
      <Circle cx={84} cy={18} r={1.8} />
      <Circle cx={88} cy={56} r={1.6} />
      <Circle cx={22} cy={70} r={1.5} />
    </G>
  );
}

function Cloud({ id, dark = false, dx = 0, dy = 0, scale = 1 }) {
  return (
    <G transform={`translate(${dx} ${dy}) scale(${scale})`}>
      <Path
        d={CLOUD}
        fill={`url(#${id}${dark ? 'dark' : 'cloud'})`}
        stroke={dark ? 'none' : '#C9D6E3'}
        strokeWidth={1.5}
      />
      <Path
        d="M28 58 C30 50 38 46 45 47"
        stroke="#FFFFFF"
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
        opacity={dark ? 0.15 : 0.7}
      />
    </G>
  );
}

function Drops({ color = '#38BDF8' }) {
  return (
    <G stroke={color} strokeWidth={5} strokeLinecap="round">
      <Line x1={34} y1={86} x2={30} y2={96} />
      <Line x1={52} y1={86} x2={48} y2={96} />
      <Line x1={70} y1={86} x2={66} y2={96} />
    </G>
  );
}

function WeatherArt({ kind = 'sun', size = 64, hideDrops = false }) {
  const id = `wa-${kind}-`;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id={`${id}sun`} cx="40%" cy="40%" r="65%">
          <Stop offset="0" stopColor="#FFE58A" />
          <Stop offset="0.55" stopColor="#FBBF24" />
          <Stop offset="1" stopColor="#F59E0B" />
        </RadialGradient>
        <LinearGradient id={`${id}moon`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#F8FAFC" />
          <Stop offset="1" stopColor="#CBD5E1" />
        </LinearGradient>
        <LinearGradient id={`${id}cloud`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" />
          <Stop offset="1" stopColor="#D6E2EE" />
        </LinearGradient>
        <LinearGradient id={`${id}dark`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#94A3B8" />
          <Stop offset="1" stopColor="#475569" />
        </LinearGradient>
      </Defs>

      {kind === 'sun' && <Sun id={id} />}

      {kind === 'moon' && (
        <>
          <Stars />
          <Moon id={id} />
        </>
      )}

      {kind === 'sunCloud' && (
        <>
          <Sun id={id} cx={38} cy={38} r={18} />
          <Cloud id={id} dx={8} dy={6} scale={0.92} />
        </>
      )}

      {kind === 'moonCloud' && (
        <>
          <Stars />
          <Moon id={id} cx={40} cy={36} r={19} />
          <Cloud id={id} dx={8} dy={8} scale={0.9} />
        </>
      )}

      {kind === 'cloud' && (
        <>
          <Cloud id={id} dark dx={18} dy={-14} scale={0.75} />
          <Cloud id={id} dy={2} />
        </>
      )}

      {kind === 'rain' && (
        <>
          <Cloud id={id} dark dy={-12} />
          {!hideDrops && <Drops />}
        </>
      )}

      {kind === 'storm' && (
        <>
          <Cloud id={id} dark dy={-14} />
          <Path
            d="M55 58 L37 84 L50 84 L42 100 L67 70 L54 70 L63 58 Z"
            fill="#FACC15"
            stroke="#EAB308"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        </>
      )}

      {kind === 'snow' && (
        <>
          <Cloud id={id} dy={-12} />
          <G fill="#93C5FD">
            <Circle cx={32} cy={90} r={4} />
            <Circle cx={50} cy={94} r={4} />
            <Circle cx={68} cy={90} r={4} />
          </G>
        </>
      )}

      {kind === 'fog' && (
        <>
          <Cloud id={id} dy={-14} />
          <G stroke="#94A3B8" strokeWidth={5} strokeLinecap="round">
            <Line x1={18} y1={78} x2={82} y2={78} />
            <Line x1={26} y1={90} x2={74} y2={90} />
          </G>
        </>
      )}

      {kind === 'wind' && (
        <G stroke="#38BDF8" strokeWidth={6} strokeLinecap="round" fill="none">
          <Path d="M12 38 H62 C72 38 76 30 72 24 C68 18 58 20 58 28" />
          <Path d="M12 56 H78 C88 56 92 64 88 70 C84 76 74 74 74 66" />
          <Path d="M20 74 H52" />
        </G>
      )}
    </Svg>
  );
}

// drawn once per kind/size; re-renders of the screen skip it
export default React.memo(WeatherArt);

/*
 * Visual Crossing icon name (+ conditions text) -> art kind.
 */
export const artKindFor = (icon, conditions) => {
  if (/thunder|storm/i.test(String(conditions || ''))) return 'storm';

  return (
    {
      'clear-day': 'sun',
      'clear-night': 'moon',
      'partly-cloudy-day': 'sunCloud',
      'partly-cloudy-night': 'moonCloud',
      cloudy: 'cloud',
      rain: 'rain',
      'showers-day': 'rain',
      'showers-night': 'rain',
      snow: 'snow',
      fog: 'fog',
      wind: 'wind',
    }[icon] || 'sunCloud'
  );
};
