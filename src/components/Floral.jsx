import React from 'react'

// Four distinct flower varieties drawn as line art: chrysanthemum, lilac, rose, delphinium.
// Used by the floral frame on the Wedding Details section.

function petals(cx, cy, count, rx, ry, rotate = 0) {
  return Array.from({ length: count }, (_, i) => {
    const a = (360 / count) * i + rotate
    return <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} transform={`rotate(${a} ${cx} ${cy})`} />
  })
}

function Chrysanthemum({ x = 0, y = 0, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} >
      <circle cx="0" cy="0" r="3" />
      {petals(0, -7, 8, 2.6, 6)}
      <g transform="rotate(22.5)">{petals(0, -10.5, 8, 3.2, 5.4, 12)}</g>
      {petals(0, -14.5, 12, 2.4, 4.6, 8)}
    </g>
  )
}

function Lilac({ x = 0, y = 0, s = 1 }) {
  const florets = [
    [0, 0, 3.1], [-4.5, -5.5, 2.8], [4.5, -5.5, 2.8], [-2.5, -11, 2.5],
    [2.5, -11, 2.5], [0, -16.5, 2.2], [-1.5, -22, 1.8], [1.5, -22, 1.8], [0, -27, 1.4],
  ]
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} >
      <path d="M0 4v-32" />
      {florets.map(([fx, fy, r], i) => (
        <g key={i}>
          <path d={`M${fx} ${fy + r * 0.6}l${r * 0.9} ${r * 0.9}M${fx} ${fy + r * 0.6}l${-r * 0.9} ${r * 0.9}M${fx} ${fy + r * 0.6}v${r * 1.2}`} />
        </g>
      ))}
    </g>
  )
}

function Rose({ x = 0, y = 0, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} >
      <path d="M0 -9c4.5 0 8 3.4 8 7.6S4.4 6.6 0 6.6-8 2.8-8-1.4-4.5-9 0-9Z" />
      <path d="M0 -4.6c2.5 0 4.4 1.9 4.4 4.2S2.4 3.8 0 3.8s-4.4-1.9-4.4-4.2S-2.5-4.6 0-4.6Z" />
      <path d="M0 -1c1.1 0 2 .8 2 1.8S1.1 2.6 0 2.6s-2-.8-2-1.8S-1.1-1 0-1Z" />
      <path d="M-8 3c-4 1.6-6.4 4.6-6.8 8.6 4-.6 6.8-2.6 8.6-6" />
      <path d="M8 3c4 1.6 6.4 4.6 6.8 8.6-4-.6-6.8-2.6-8.6-6" />
    </g>
  )
}

function Delphinium({ x = 0, y = 0, s = 1 }) {
  const flowers = [[0, -2], [-6, -7.5], [6, -7.5], [-2, -13], [2, -13], [-5, -18.5], [5, -18.5], [0, -24], [0, -30]]
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} >
      <path d="M0 6v-38" />
      {flowers.map(([fx, fy], i) => (
        <g key={i} transform={`translate(${fx} ${fy})`}>
          <path d="M0 -2.4c1.8 0 3.2 1.3 3.2 2.9S1.8 3.4 0 3.4-3.2 2  -3.2 0.5-1.8-2.4 0-2.4Z" />
        </g>
      ))}
    </g>
  )
}

/** Corner spray combining all four varieties — mirrored by the caller. */
export function FloralCorner({ className = '' }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <g fill="none" stroke="#172746" strokeWidth="1.2" strokeLinecap="round">
        <path d="M2 118C26 96 34 66 60 50 74 42 92 38 118 36" stroke="#10182B" />
        <path d="M10 112c14-16 20-34 30-52" />
        <path d="M58 52c-8-6-16-8-26-7 4 9 12 14 24 15" />
        <path d="M62 48c4-10 12-16 22-18-1 10-7 17-19 21" />
      </g>
      <g fill="#FAF9F6" stroke="#172746" strokeWidth="1.2" strokeLinecap="round">
        <Chrysanthemum x={38} y={70} s={1.5} />
        <Rose x={84} y={40} s={1.2} />
        <Lilac x={16} y={98} s={1.15} />
        <Delphinium x={62} y={92} s={1.05} />
      </g>
      <g stroke="#A77A30" strokeWidth="1.1" fill="none" strokeLinecap="round">
        <path d="M50 62c6 3 10 8 12 14" />
        <path d="M72 50c2 5 6 9 12 11" />
      </g>
    </svg>
  )
}
