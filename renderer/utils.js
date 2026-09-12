const HOUR_MS = 3600000;

const pad2 = (n) => String(n).padStart(2, '0');

export function isUrgent(item, nowMs) {
  const diff = item.timeMs - nowMs;
  // 提醒：截止时间在 1 小时内或已逾期 → 红色
  if (item.type === 'reminder') return diff <= HOUR_MS;
  // 日历：全天事件不紧迫；正在进行的也不紧迫
  if (item.allDay) return false;
  if (item.endMs != null && item.timeMs <= nowMs && nowMs <= item.endMs) return false;
  return diff >= 0 && diff <= HOUR_MS;
}

export function timeLabel(item, nowMs) {
  const fmt = (ms) => {
    const d = new Date(ms);
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  };
  if (item.type === 'calendar') {
    if (item.allDay) return '全天';
    if (item.endMs != null && item.timeMs <= nowMs && nowMs <= item.endMs) return '进行中';
    return `${fmt(item.timeMs)} 开始`;
  }
  if (item.timeMs < nowMs) return `${fmt(item.timeMs)} 已到期`;
  return `${fmt(item.timeMs)} 截止`;
}
