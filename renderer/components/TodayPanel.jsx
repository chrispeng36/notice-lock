import { forwardRef } from 'react';
import { isUrgent, timeLabel } from '../utils';

export const TodayPanel = forwardRef(function TodayPanel({ open, tasks, nowMs, onRefresh }, ref) {
  return (
    <div ref={ref} className={`panel ${open ? 'open' : ''}`}>
      <div className="panel-head">
        <span className="panel-title">今日待办</span>
        {tasks.items.length > 0 && <span className="panel-count">{tasks.items.length}</span>}
        <button className="panel-refresh" title="刷新" onClick={onRefresh}>&#8635;</button>
      </div>
      <div className="panel-body">
        {tasks.status === 'loading' && tasks.items.length === 0 && <div className="hint">读取中…</div>}
        {tasks.status === 'error' && (
          <div className="hint err">
            <div>部分数据读取失败</div>
            <div className="hint-sub">系统设置 → 隐私与安全性 → 日历/提醒事项</div>
            <button className="hint-btn" onClick={onRefresh}>重试</button>
          </div>
        )}
        {tasks.items.length === 0 && tasks.status === 'ok' && <div className="hint">今天没有待办事项</div>}
        {tasks.items.map((item) => {
          const urgent = isUrgent(item, nowMs);
          return (
            <div key={item.id} className={`task ${urgent ? 'urgent' : ''}`}>
              <span className={`dot ${item.type}`}></span>
              <span className="task-title" title={item.title}>{item.title}</span>
              <span className="task-time">{timeLabel(item, nowMs)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
});
