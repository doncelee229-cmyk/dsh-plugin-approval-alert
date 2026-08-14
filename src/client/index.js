/**
 * dsh-plugin-approval-alert
 * ==========================
 * DeepSeek Harness 审批提醒插件（web 客户端 / browser client half）。
 *
 * 功能：
 *  - 需要用户审批（approval）或需要用户选择方案（question / plan-review，即
 *    ask_user_question 流程）时，弹出系统级通知（桌面右下角，浏览器外部）；
 *  - 通知内容简洁：直接写明哪个工作区需要审批 / 需要选择方案；
 *  - 通知语言随系统语言切换：简体中文 / 繁体中文 / 英文；
 *  - 点击通知：原页面存活时直接跳转到对应工作区/会话；
 *    通知点击导致浏览器新开窗口/标签页时，新页面加载后自动打开目标会话；
 *  - 通知 3 秒后自动消失；
 *  - 同时播放提示音（首次交互自动解锁音频，规避浏览器自动播放策略）。
 *
 * 兼容性：Win10 / Win11 / Linux / macOS（Web Notifications API + Web Audio API）。
 *
 * 这是标准的 dsh web 客户端插件模块：导出 `name`、`inject` 与 `apply(ctx)`，
 * 由 harness 的客户端构建管线打包为 `window.__ModuleLoader__.load(...)` 模块。
 */

import * as React from 'react';

export const name = 'approval-alert';
export const inject = ['slots'];

/* 需要提醒的挂起交互类型：审批，或需要用户选择方案的问题。 */
const INTERACTION_KINDS = ['approval', 'question', 'plan-review'];

/* 多语言文案：简体 / 繁体 / 英文。 */
const STRINGS = {
  'zh-CN': {
    approvalTitle: '需要审批',
    questionTitle: '需要选择方案',
    wsApproval: '工作区「{n}」需要审批',
    wsQuestion: '工作区「{n}」需要选择方案',
    sApproval: '会话「{n}」需要审批',
    sQuestion: '会话「{n}」需要选择方案',
  },
  'zh-TW': {
    approvalTitle: '需要審批',
    questionTitle: '需要選擇方案',
    wsApproval: '工作區「{n}」需要審批',
    wsQuestion: '工作區「{n}」需要選擇方案',
    sApproval: '會話「{n}」需要審批',
    sQuestion: '會話「{n}」需要選擇方案',
  },
  en: {
    approvalTitle: 'Approval needed',
    questionTitle: 'Decision needed',
    wsApproval: 'Workspace "{n}" needs approval',
    wsQuestion: 'Workspace "{n}" needs your input',
    sApproval: 'Session "{n}" needs approval',
    sQuestion: 'Session "{n}" needs your input',
  },
};

/** 按浏览器/系统语言判定通知语言：简体中文 / 繁体中文 / 其他一律英文。 */
function detectLang() {
  try {
    const raw = String(
      navigator.language || (Array.isArray(navigator.languages) ? navigator.languages[0] : '') || 'en',
    ).toLowerCase();
    if (raw === 'zh' || raw.startsWith('zh-cn') || raw.startsWith('zh-sg') || raw.includes('hans')) return 'zh-CN';
    if (raw.startsWith('zh')) return 'zh-TW';
  } catch (err) {}
  return 'en';
}

export function apply(ctx) {
  const TARGET_KEY = 'dsh-aprl-target';

  /* ---- audio: unlock on first user gesture, then reuse one context ---- */
  let actx = null;
  function getCtx() {
    if (actx === null) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (Ctor === undefined) return null;
      actx = new Ctor();
    }
    return actx;
  }
  function unlockAudio() {
    try {
      const c = getCtx();
      if (c !== null && c.state === 'suspended') c.resume().catch(() => {});
    } catch (err) {
      console.log('approval alert audio unlock failed:', err && err.message);
    }
  }
  function playChime() {
    try {
      const c = getCtx();
      if (c === null) return;
      unlockAudio();
      const notes = [880, 1174.66];
      const base = c.currentTime;
      notes.forEach((freq, index) => {
        const osc = c.createOscillator();
        const gain = c.createGain();
        const start = base + index * 0.16;
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.28, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.34);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(start);
        osc.stop(start + 0.38);
      });
    } catch (err) {
      console.log('approval alert chime unavailable:', err && err.message);
    }
  }

  /* ---- notification permission (asked once on the first gesture) ---- */
  function ensureNotificationPermission() {
    try {
      if (typeof Notification === 'undefined') return;
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    } catch (err) {
      console.log('approval alert permission request failed:', err && err.message);
    }
  }

  /* ---- target routing: survive both a live page click and a fresh window ---- */
  function setTarget(sessionId) {
    try {
      localStorage.setItem(TARGET_KEY, sessionId);
      sessionStorage.setItem(TARGET_KEY, '1');
    } catch (err) {
      console.log('approval alert target store failed:', err && err.message);
    }
  }
  function clearTarget() {
    try {
      localStorage.removeItem(TARGET_KEY);
      sessionStorage.removeItem(TARGET_KEY);
    } catch (err) {}
  }

  const sessions = ctx.get('sessions');
  function showNativeNotification(title, body, sessionId) {
    try {
      if (typeof Notification === 'undefined') return;
      if (Notification.permission !== 'granted') {
        if (Notification.permission === 'default') {
          Notification.requestPermission().then((granted) => {
            if (granted === 'granted') showNativeNotification(title, body, sessionId);
          }).catch(() => {});
        }
        return;
      }
      setTarget(sessionId);
      const n = new Notification(title, {
        body: body,
        tag: 'dsh-approval-alert',
        silent: true
      });
      n.onclick = () => {
        try { window.focus(); } catch (err) {}
        if (sessionId !== undefined && sessions !== undefined) {
          try { sessions.open(sessionId); } catch (err) {
            console.log('approval alert jump failed:', err && err.message);
          }
        }
        clearTarget();
        try { n.close(); } catch (err) {}
      };
      // 不手动关闭：让系统按默认停留时长显示，从而播放系统自带的通知动画。
    } catch (err) {
      console.log('approval alert notification unavailable:', err && err.message);
    }
  }

  // One gesture unlocks audio AND offers notification permission.
  const onGesture = () => {
    unlockAudio();
    ensureNotificationPermission();
  };
  window.addEventListener('pointerdown', onGesture, { once: true });
  window.addEventListener('keydown', onGesture, { once: true });
  window.addEventListener('touchstart', onGesture, { once: true });
  ctx.effect(() => () => {
    window.removeEventListener('pointerdown', onGesture);
    window.removeEventListener('keydown', onGesture);
    window.removeEventListener('touchstart', onGesture);
    if (actx !== null) {
      try { actx.close(); } catch (err) {}
    }
  }, 'approval-alert: audio');

  /* ---- watcher: approval & question alerts; workspace-aware; bilingual ---- */
  function ApprovalWatcher(props) {
    if (typeof props.useSessions !== 'function') return null;
    const list = props.useSessions((state) => state);
    const workspaces = typeof props.useWorkspaces === 'function' ? props.useWorkspaces((state) => state) : undefined;
    const current = list.current;
    const currentItem = current !== undefined ? list.byId[current] : undefined;
    const currentStatus = currentItem !== undefined && INTERACTION_KINDS.includes(currentItem.pendingInteraction)
      ? currentItem.pendingInteraction
      : undefined;
    const currentPending = currentStatus !== undefined;
    const other = currentPending
      ? undefined
      : list.ids.map((id) => list.byId[id]).find((entry) => entry !== undefined && entry.id !== current && INTERACTION_KINDS.includes(entry.pendingInteraction));
    const pending = currentPending || other !== undefined;
    const target = currentPending ? currentItem : other;
    const targetStatus = currentPending ? currentStatus : (other !== undefined ? other.pendingInteraction : undefined);
    const isApproval = targetStatus === 'approval';

    // Fresh window (opened by clicking the OS toast): sessionStorage is empty,
    // so consume the stored target once the session list has it loaded.
    React.useEffect(() => {
      let raw = null;
      try { raw = localStorage.getItem(TARGET_KEY); } catch (err) {}
      if (raw === null || raw === '') return;
      let freshTab = true;
      try { freshTab = sessionStorage.getItem(TARGET_KEY) === null; } catch (err) {}
      if (!freshTab) return;
      if (list.ids.includes(raw) || list.byId[raw] !== undefined) {
        clearTarget();
        if (sessions !== undefined) {
          try { sessions.open(raw); } catch (err) {
            console.log('approval alert target open failed:', err && err.message);
          }
        }
      } else if (list.phase !== 'pending') {
        clearTarget(); // list loaded but the target session is gone: stale
      }
    }, [list]);

    const prev = React.useRef(false);
    React.useEffect(() => {
      if (pending && !prev.current && target !== undefined) {
        const lang = detectLang();
        const s = STRINGS[lang] || STRINGS.en;
        const workspace = workspaces === undefined
          ? undefined
          : workspaces.items.find((w) => w.sessionIds.includes(target.id));
        const workspaceName = workspace === undefined ? undefined : (workspace.title || workspace.path || workspace.workspaceId);
        const sessionName = target.displayTitle || target.title || target.id;
        const title = isApproval ? s.approvalTitle : s.questionTitle;
        const template = isApproval
          ? (workspaceName !== undefined ? s.wsApproval : s.sApproval)
          : (workspaceName !== undefined ? s.wsQuestion : s.sQuestion);
        const body = template.replace('{n}', String(workspaceName !== undefined ? workspaceName : sessionName));
        playChime();
        showNativeNotification(title, body, target.id);
      }
      if (!pending) clearTarget();
      prev.current = pending;
    }, [pending]);
    return null;
  }

  ctx.slots.inject('shell.overlay', () => ctx.slots.register(
    { name: 'shell.overlay', id: 'approval-alert', order: 100, label: 'Approval alert' },
    ApprovalWatcher,
  ));
}
