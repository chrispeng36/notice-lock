// 表盘刻度：60 个，整点刻度加粗。坐标为 viewBox 0 0 360 360 下的固定值
const TICKS = Array.from({ length: 60 }, (_, i) => {
  const major = i % 5 === 0;
  const angle = (i / 60) * 2 * Math.PI - Math.PI / 2;
  const r1 = major ? 160 : 163;
  const r2 = major ? 152 : 157;
  return {
    id: i,
    major,
    x1: 180 + r1 * Math.cos(angle),
    y1: 180 + r1 * Math.sin(angle),
    x2: 180 + r2 * Math.cos(angle),
    y2: 180 + r2 * Math.sin(angle),
  };
});

export function Ticks() {
  return (
    <svg id="ticks" className="ring" viewBox="0 0 360 360">
      {TICKS.map((t) => (
        <line
          key={t.id}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          stroke={t.major ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.16)'}
          strokeWidth={t.major ? 3 : 1}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}
