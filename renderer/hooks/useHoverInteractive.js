import { useEffect, useRef } from 'react';

const OPEN_DELAY = 220;
const CLOSE_DELAY = 450;

// 鼠标穿透 + 悬停交互：
// - 窗口默认点击穿透（透明区域不挡其他应用）
// - 光标落在圆盘上 → 打开待办面板、切换为可交互
// - 光标落在圆盘或面板上时保持交互；移出两者后恢复穿透并关闭面板
export function useHoverInteractive({ panelOpen, setPanelOpen, panelRef }) {
  const interactiveRef = useRef(false);
  const panelOpenRef = useRef(panelOpen);
  const openTimer = useRef(null);
  const closeTimer = useRef(null);
  panelOpenRef.current = panelOpen;

  useEffect(() => {
    const overCard = (x, y) => {
      const el = document.querySelector('#card');
      if (!el) return false;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      return Math.hypot(x - cx, y - cy) <= r.width / 2;
    };
    const overPanel = (x, y) => {
      const el = panelRef.current;
      if (!el || !panelOpenRef.current) return false;
      const r = el.getBoundingClientRect();
      return x >= r.left - 4 && x <= r.right + 4 && y >= r.top - 4 && y <= r.bottom + 4;
    };

    const setInteractive = (v) => window.clockAPI?.setInteractive(v);

    const update = (e) => {
      const { clientX, clientY } = e;
      const over = overCard(clientX, clientY) || overPanel(clientX, clientY);

      if (over && !panelOpenRef.current) {
        clearTimeout(closeTimer.current);
        openTimer.current = setTimeout(() => setPanelOpen(true), OPEN_DELAY);
      }
      if (!over) {
        clearTimeout(openTimer.current);
        if (panelOpenRef.current) {
          closeTimer.current = setTimeout(() => setPanelOpen(false), CLOSE_DELAY);
        }
      }

      if (over !== interactiveRef.current) {
        interactiveRef.current = over;
        setInteractive(over);
      }
    };

    const onLeave = () => {
      clearTimeout(openTimer.current);
      if (interactiveRef.current) {
        interactiveRef.current = false;
        setInteractive(false);
      }
      if (panelOpenRef.current) {
        closeTimer.current = setTimeout(() => setPanelOpen(false), CLOSE_DELAY);
      }
    };

    window.addEventListener('mousemove', update);
    window.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', update);
      window.removeEventListener('mouseleave', onLeave);
      clearTimeout(openTimer.current);
      clearTimeout(closeTimer.current);
    };
  }, [panelRef, setPanelOpen]);
}
