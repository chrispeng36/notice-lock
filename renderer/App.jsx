import { useRef, useState } from 'react';
import { useNow } from './hooks/useNow';
import { useHoverInteractive } from './hooks/useHoverInteractive';
import { useTodayTasks } from './hooks/useTodayTasks';
import { Ticks } from './components/Ticks';
import { TodayPanel } from './components/TodayPanel';
import { isUrgent } from './utils';

const pad = (n) => String(n).padStart(2, '0');
const WEEK = ['日', '一', '二', '三', '四', '五', '六'];
const RING_CIRC = 2 * Math.PI * 150;

export default function App() {
  const now = useNow(50);
  const nowMs = now.getTime();
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef(null);
  const tasks = useTodayTasks({ active: panelOpen });
  useHoverInteractive({ panelOpen, setPanelOpen, panelRef });

  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());
  const date = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 · 周${WEEK[now.getDay()]}`;
  // 秒针进度环：每秒平滑扫过一整圈
  const arcDash = ((now.getSeconds() + now.getMilliseconds() / 1000) / 60) * RING_CIRC;
  const urgentCount = tasks.items.filter((it) => isUrgent(it, nowMs)).length;

  const togglePanel = () => setPanelOpen((v) => !v);

  return (
    <>
      <div id="card">
        <div className="ring conic-ring"></div>
        <Ticks />
        <svg className="ring" viewBox="0 0 360 360">
          <defs>
            <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00e5ff" />
              <stop offset="100%" stopColor="#ff00e5" />
            </linearGradient>
          </defs>
          <circle
            id="second-arc"
            cx="180"
            cy="180"
            r="150"
            fill="none"
            stroke="url(#arcGrad)"
            strokeWidth="6"
            strokeLinecap="round"
            transform="rotate(-90 180 180)"
            strokeDasharray={`${arcDash} ${RING_CIRC}`}
            style={{ filter: 'drop-shadow(0 0 6px rgba(0,229,255,0.8))' }}
          />
        </svg>
        <div id="center">
          <div id="time">
            <span className="num">{hours}</span>
            <span className="colon">:</span>
            <span className="num">{minutes}</span>
            <span className="colon">:</span>
            <span className="num">{seconds}</span>
          </div>
          <div id="date">{date}</div>
        </div>
        <button id="menu-btn" title="菜单" onClick={() => window.clockAPI?.showMenu()}>
          &#8942;
        </button>
        {tasks.items.length > 0 && (
          <button className={`badge ${urgentCount > 0 ? 'hot' : ''}`} title="今日待办" onClick={togglePanel}>
            {tasks.items.length}
          </button>
        )}
      </div>
      <TodayPanel ref={panelRef} open={panelOpen} tasks={tasks} nowMs={nowMs} onRefresh={tasks.refresh} />
    </>
  );
}
