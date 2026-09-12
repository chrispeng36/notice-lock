import { useCallback, useEffect, useState } from 'react';

// 读取今日待办（提醒事项 + 日历），面板打开时立即刷新，平时定期刷新
export function useTodayTasks({ active = false, refreshInterval = 300000 } = {}) {
  const [state, setState] = useState({ status: 'loading', items: [], errors: [] });

  const refresh = useCallback(async () => {
    try {
      const res = await window.clockAPI.getTodayTasks();
      if (res && res.ok) {
        setState({ status: 'ok', items: res.items || [], errors: [] });
      } else {
        setState({ status: 'error', items: res?.items || [], errors: res?.errors || ['读取失败'] });
      }
    } catch (err) {
      setState({ status: 'error', items: [], errors: [String((err && err.message) || err)] });
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, refreshInterval);
    return () => clearInterval(id);
  }, [refresh, refreshInterval]);

  useEffect(() => {
    if (active) refresh();
  }, [active, refresh]);

  return { ...state, refresh };
}
