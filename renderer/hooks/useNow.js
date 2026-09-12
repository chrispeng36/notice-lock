import { useEffect, useState } from 'react';

// 定时刷新当前时间；interval 越小秒针进度环越平滑
export function useNow(interval = 50) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), interval);
    return () => clearInterval(id);
  }, [interval]);

  return now;
}
