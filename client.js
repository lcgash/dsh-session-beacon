window.__ModuleLoader__.load({
  id: 'dsh-session-beacon',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const NS = 'session-beacon'
    const MAX_BADGES = 6
    const ALL_SESSIONS_ID = 'dsb-all-sessions'
    const PREVIEW_ID = 'dsb-session-preview'
    const KIND_ORDER = { waiting: 0, running: 1, ended: 2, idle: 3 }
    const PENDING_KIND_KEY = {
      approval: 'waitingApproval',
      question: 'waitingAnswer',
      'plan-review': 'waitingPlanReview',
    }

    const zh = {
      beacon: '会话信号灯',
      running: '进行中',
      waiting: '等待输入',
      waitingApproval: '等待审批',
      waitingAnswer: '等待回答',
      waitingPlanReview: '计划待审',
      ended: '刚完成',
      idle: '空闲',
      active: '活跃',
      allSessions: '所有会话',
      open: '打开会话',
      openNamed: '打开会话 {title}',
      collapse: '收起会话信号灯',
      expand: '展开会话信号灯',
      current: '当前',
      sessionsCount: '{n} 个会话',
      idleCount: '{n} 空闲',
      activeCount: '{n} 个活跃会话',
      openFailed: '无法打开该会话',
      previewReply: '回复',
      previewLoading: '正在读取最近回复…',
      previewEmpty: '暂无已完成的回复',
      previewPending: '正在生成回复…',
      previewUnavailable: '暂时无法读取回复',
      previewTurn: '第 {n} 轮',
      justNow: '刚刚',
      minutesAgo: '{n} 分钟前',
      hoursAgo: '{n} 小时前',
      daysAgo: '{n} 天前',
    }

    const en = {
      beacon: 'Session beacons',
      running: 'Running',
      waiting: 'Needs input',
      waitingApproval: 'Waiting for approval',
      waitingAnswer: 'Waiting for answer',
      waitingPlanReview: 'Plan review',
      ended: 'Just completed',
      idle: 'Idle',
      active: 'active',
      allSessions: 'All sessions',
      open: 'Open session',
      openNamed: 'Open session {title}',
      collapse: 'Collapse session beacons',
      expand: 'Expand session beacons',
      current: 'Current',
      sessionsCount: '{n} sessions',
      idleCount: '{n} idle',
      activeCount: '{n} active sessions',
      openFailed: 'Could not open this session',
      previewReply: 'Reply',
      previewLoading: 'Loading latest reply…',
      previewEmpty: 'No completed reply yet',
      previewPending: 'Reply still in progress',
      previewUnavailable: 'Reply preview is unavailable',
      previewTurn: 'Turn {n}',
      justNow: 'just now',
      minutesAgo: '{n}m ago',
      hoursAgo: '{n}h ago',
      daysAgo: '{n}d ago',
    }

    const CSS = `
.dsb-wrap {
  position: fixed;
  top: calc(var(--dsh-frame-chrome-top, 0px) + 84px);
  left: 68px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  width: max-content;
  max-width: calc(100vw - 32px);
  pointer-events: none;
  -webkit-app-region: no-drag;
  font: inherit;
  color: var(--dsw-alias-label-primary);
}
.dsb-launcher {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  pointer-events: auto;
  -webkit-app-region: no-drag;
  cursor: pointer;
}
.dsb-launcherGlyph {
  display: inline-flex;
  color: var(--dsw-alias-label-secondary);
}
.dsb-launcherGlyph[data-kind='waiting'] { color: var(--dsw-alias-state-warn-primary); }
.dsb-launcherGlyph[data-kind='ended'] { color: var(--dsw-alias-state-success-primary); }
.dsb-launcherGlyph[data-kind='running'] { color: var(--dsw-alias-state-business-primary); }
.dsb-launcherHalo {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 18px;
  height: 18px;
  margin: -9px 0 0 -9px;
  border-radius: 50%;
  box-shadow: 0 0 0 0 color-mix(in srgb, var(--dsw-alias-state-business-primary) 48%, transparent);
  animation: dsb-ripple-ongoing 2.2s ease-out infinite;
  pointer-events: none;
}
.dsb-bar {
  pointer-events: auto;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 4px;
  max-width: min(760px, calc(100vw - 84px));
  padding: 4px;
  border: 0.5px solid var(--dsw-alias-border-l1);
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsw-alias-bg-overlay) 94%, transparent);
  box-shadow: var(--dsw-elevation-soft);
  -webkit-backdrop-filter: blur(14px) saturate(1.1);
  backdrop-filter: blur(14px) saturate(1.1);
  -webkit-app-region: no-drag;
  overflow: hidden;
}
.dsb-brand {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 26px;
  padding: 0 4px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  font: inherit;
  color: inherit;
  cursor: pointer;
}
.dsb-icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  color: var(--dsw-alias-label-secondary);
}
.dsb-badges {
  display: flex;
  flex: 1 1 auto;
  gap: 4px;
  min-width: 0;
  padding: 0 2px;
  overflow-x: auto;
  scrollbar-width: none;
}
.dsb-badges::-webkit-scrollbar { display: none; }
.dsb-badges[data-overflow='1'] {
  -webkit-mask-image: linear-gradient(to right, black calc(100% - 16px), transparent);
  mask-image: linear-gradient(to right, black calc(100% - 16px), transparent);
}
.dsb-badge,
.dsb-chip,
.dsb-collapse {
  flex: none;
  border: 0;
  background: transparent;
  font: inherit;
  color: inherit;
  cursor: pointer;
}
.dsb-badge {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  padding: 0 10px 0 8px;
  border: 0.5px solid transparent;
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 5%, transparent);
  transition: background 140ms ease, border-color 140ms ease;
}
@media (hover: hover) {
  .dsb-badge:hover,
  .dsb-brand:hover,
  .dsb-chip:hover,
  .dsb-collapse:hover,
  .dsb-launcher:hover {
    background: color-mix(in srgb, var(--dsw-alias-label-primary) 10%, transparent);
  }
}
.dsb-launcher:focus-visible,
.dsb-badge:focus-visible,
.dsb-brand:focus-visible,
.dsb-chip:focus-visible,
.dsb-collapse:focus-visible {
  outline: 2px solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary));
  outline-offset: 1px;
}
.dsb-row:focus-visible {
  outline: 2px solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary));
  outline-offset: -2px;
}
.dsb-badge[data-kind='running'] {
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary) 10%, transparent);
  border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary) 22%, transparent);
}
.dsb-badge[data-kind='waiting'] {
  background: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 12%, transparent);
  border-color: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 24%, transparent);
}
.dsb-badge[data-kind='ended'] {
  background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 10%, transparent);
  border-color: color-mix(in srgb, var(--dsw-alias-state-success-primary) 22%, transparent);
}
.dsb-badge[data-current='1'] {
  box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--dsw-alias-state-business-primary) 65%, transparent);
}
.dsb-currentTag {
  flex: none;
  padding: 1px 5px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary) 14%, transparent);
  font-size: 9px;
  line-height: 13px;
  color: var(--dsw-alias-label-secondary);
}
.dsb-dot {
  flex: none;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--dsw-alias-state-idle-primary);
}
.dsb-dot[data-kind='running'] {
  background: var(--dsw-alias-state-business-primary);
  animation: dsb-ripple-ongoing 2.4s ease-out infinite;
}
.dsb-dot[data-kind='waiting'] {
  background: var(--dsw-alias-state-warn-primary);
  animation: dsb-ripple-warn 1.7s ease-out infinite;
}
.dsb-dot[data-kind='ended'] {
  background: var(--dsw-alias-state-success-primary);
}
@keyframes dsb-ripple-ongoing {
  0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--dsw-alias-state-business-primary) 45%, transparent); }
  70% { box-shadow: 0 0 0 6px transparent; }
  100% { box-shadow: 0 0 0 0 transparent; }
}
@keyframes dsb-ripple-warn {
  0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--dsw-alias-state-warn-primary) 50%, transparent); }
  70% { box-shadow: 0 0 0 7px transparent; }
  100% { box-shadow: 0 0 0 0 transparent; }
}
@media (prefers-reduced-motion: reduce) {
  .dsb-dot { animation: none !important; }
}
.dsb-title {
  max-width: 118px;
  overflow: hidden;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dsb-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 26px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 12px;
  line-height: 16px;
  color: var(--dsw-alias-label-secondary);
  white-space: nowrap;
}
.dsb-collapse {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border-radius: 50%;
  color: var(--dsw-alias-label-secondary);
}
.dsb-panel {
  position: relative;
  top: 0;
  left: 0;
  pointer-events: auto;
  box-sizing: border-box;
  width: min(352px, calc(100vw - 84px));
  padding: 6px;
  border: 0.5px solid var(--dsw-alias-border-l1);
  border-radius: 14px;
  background: var(--dsw-alias-bg-overlay);
  box-shadow: var(--dsw-elevation-panel);
  -webkit-app-region: no-drag;
}
.dsb-panelHead {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 4px 6px 6px;
  font-size: 12px;
  line-height: 16px;
  color: var(--dsw-alias-label-secondary);
}
.dsb-panelHead strong {
  font-size: 13px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary);
}
.dsb-panelList {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: min(342px, calc(100vh - var(--dsh-frame-chrome-top, 0px) - 220px));
  overflow-y: auto;
}
.dsb-row {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 8px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
}
@media (hover: hover) {
  .dsb-row:hover {
    background: color-mix(in srgb, var(--dsw-alias-label-primary) 8%, transparent);
  }
}
.dsb-rowMain {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-width: 0;
  gap: 1px;
}
.dsb-rowTitle {
  overflow: hidden;
  font-size: 13px;
  font-weight: 500;
  line-height: 17px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dsb-rowMeta {
  overflow: hidden;
  font-size: 12px;
  line-height: 16px;
  color: var(--dsw-alias-label-secondary);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dsb-tag {
  flex: none;
  margin-left: auto;
  padding: 1px 6px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary) 12%, transparent);
  font-size: 11px;
  line-height: 15px;
  color: var(--dsw-alias-label-secondary);
}
.dsb-preview {
  position: relative;
  top: 0;
  left: 0;
  pointer-events: none;
  box-sizing: border-box;
  width: min(340px, calc(100vw - 84px));
  padding: 10px;
  border: 0.5px solid var(--dsw-alias-border-l1);
  border-radius: 14px;
  background: var(--dsw-alias-bg-overlay);
  box-shadow: var(--dsw-elevation-panel);
  -webkit-app-region: no-drag;
}
.dsb-previewHead {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.dsb-previewTitle {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  font-size: 13px;
  font-weight: 600;
  line-height: 17px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dsb-previewStatus {
  flex: none;
  font-size: 11px;
  line-height: 15px;
  color: var(--dsw-alias-label-secondary);
  white-space: nowrap;
}
.dsb-previewLabel {
  margin-top: 8px;
  font-size: 11px;
  line-height: 15px;
  color: var(--dsw-alias-label-secondary);
}
.dsb-previewBody {
  margin-top: 3px;
  max-height: 72px;
  overflow: hidden;
  font-size: 12px;
  line-height: 18px;
  color: var(--dsw-alias-label-primary);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.dsb-previewBody[data-muted='1'] {
  color: var(--dsw-alias-label-secondary);
}
.dsb-previewMeta {
  display: flex;
  gap: 6px;
  margin-top: 6px;
  font-size: 11px;
  line-height: 15px;
  color: var(--dsw-alias-label-secondary);
}
.dsb-notice {
  pointer-events: none;
  padding: 5px 10px;
  border: 0.5px solid color-mix(in srgb, var(--dsw-alias-state-warn-primary) 45%, transparent);
  border-radius: 999px;
  background: var(--dsw-alias-bg-overlay);
  box-shadow: var(--dsw-elevation-soft);
  font-size: 12px;
  line-height: 16px;
  color: var(--dsw-alias-label-primary);
}
.dsb-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  border: 0;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}
@media (max-width: 720px) {
  .dsb-title { max-width: 92px; }
  .dsb-bar { max-width: calc(100vw - 84px); }
}
`
    let barCloseTimer = null

    const beaconStore = {
      state: { barOpen: false, barHovered: false, panelOpen: false, anchor: null, opener: null },
      listeners: new Set(),
      update(patch) {
        this.state = { ...this.state, ...patch }
        for (const listener of [...this.listeners]) {
          try { listener() } catch { /* ignore */ }
        }
      },
      subscribe(listener) {
        this.listeners.add(listener)
        return () => { this.listeners.delete(listener) }
      },
      cancelClose() {
        if (barCloseTimer !== null) {
          clearTimeout(barCloseTimer)
          barCloseTimer = null
        }
      },
      scheduleClose() {
        this.cancelClose()
        barCloseTimer = setTimeout(() => {
          barCloseTimer = null
          if (this.state.panelOpen || this.state.barHovered) return
          this.update({ barOpen: false })
        }, 3000)
      },
    }

    function useBeaconState() {
      const [, setRevision] = React.useState(0)
      React.useEffect(() => beaconStore.subscribe(() => setRevision(value => value + 1)), [])
      return beaconStore.state
    }

    function fill(template, params) {
      if (params === undefined) return template
      return template.replace(/\{(\w+)\}/g, (match, key) => {
        const value = params[key]
        return value === undefined ? match : String(value)
      })
    }

    function fallbackT() {
      const useZh = typeof document !== 'undefined' && /^zh/i.test(document.documentElement.lang || '')
      const dict = useZh ? zh : en
      return (key, params) => fill(dict[key] ?? en[key] ?? key, params)
    }

    function shortId(id) {
      const value = String(id ?? '')
      return value.length > 12 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value
    }

    function relativeTime(updatedAt, now, t) {
      const stamp = Number(updatedAt)
      if (!Number.isFinite(stamp) || stamp <= 0) return ''
      const delta = Math.max(0, now - stamp)
      if (delta < 60_000) return t('justNow')
      if (delta < 3_600_000) return t('minutesAgo', { n: Math.floor(delta / 60_000) })
      if (delta < 86_400_000) return t('hoursAgo', { n: Math.floor(delta / 3_600_000) })
      return t('daysAgo', { n: Math.floor(delta / 86_400_000) })
    }

    function statusOf(row, status) {
      if (status?.pendingInteraction !== undefined && status?.pendingInteraction !== null) return 'waiting'
      if (status?.running === true) return 'running'
      if (status?.running === undefined && row?.running === true) return 'running'
      if (status?.completionUnread === true) return 'ended'
      return 'idle'
    }

    function statusLabel(row, t) {
      if (row.kind === 'waiting') {
        const key = PENDING_KIND_KEY[row.pendingKind]
        if (key !== undefined) return t(key)
      }
      return t(row.kind)
    }

    function buildRows(list, statusById) {
      const ids = new Set()
      for (const id of list?.ids ?? []) ids.add(id)
      if (ids.size === 0 && list?.byId) {
        for (const id of Object.keys(list.byId)) ids.add(id)
      }
      const rows = []
      for (const id of ids) {
        const row = list?.byId?.[id]
        if (row?.origin === 'subagent') continue
        const status = statusById?.get?.(id)
        const pendingKind = typeof status?.pendingInteraction?.kind === 'string'
          ? status.pendingInteraction.kind
          : undefined
        const kind = statusOf(row, status)
        if (row?.blank === true && kind === 'idle') continue
        if (row === undefined && kind === 'idle') continue
        rows.push({
          id,
          title: row?.displayTitle || row?.title || shortId(id),
          kind,
          pendingKind: kind === 'waiting' ? pendingKind : undefined,
          current: (row?.retainedBy?.mainView ?? 0) > 0,
          updatedAt: row?.updatedAt ?? 0,
          cwd: row?.cwd,
          blank: row?.blank === true,
        })
      }
      rows.sort((left, right) => {
        const byKind = KIND_ORDER[left.kind] - KIND_ORDER[right.kind]
        if (byKind !== 0) return byKind
        const byTime = (right.updatedAt || 0) - (left.updatedAt || 0)
        if (byTime !== 0) return byTime
        return left.title.localeCompare(right.title)
      })
      return rows
    }

    function openSession(ctx, sessionId) {
      try {
        const workspace = ctx?.get?.('uiWorkspace')
        if (workspace && typeof workspace.openSession === 'function') {
          workspace.openSession(sessionId)
          return true
        }
      } catch (error) {
        try { console.warn('[session-beacon] uiWorkspace.openSession failed', error) } catch { /* ignore */ }
      }
      return false
    }

    function BeaconGlyph({ size = 15 }) {
      return h('svg', {
        width: size, height: size, viewBox: '0 0 24 24', 'aria-hidden': 'true',
        style: { display: 'block', fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' },
      },
        h('circle', { cx: 12, cy: 12, r: 8.5, strokeWidth: 1.6, opacity: 0.7 }),
        h('circle', { cx: 12, cy: 12, r: 4.2, strokeWidth: 1.9 }),
        h('circle', { cx: 12, cy: 12, r: 1.7, fill: 'currentColor', stroke: 'none' }))
    }

    function Chevron({ up, size = 12 }) {
      return h('svg', {
        width: size, height: size, viewBox: '0 0 12 12', 'aria-hidden': 'true',
        style: { display: 'block', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' },
      },
        h('path', { d: up ? 'M3 8l3-3 3 3' : 'M3 5l3 3 3-3' }))
    }

    class BeaconBoundary extends React.Component {
      constructor(props) {
        super(props)
        this.state = { failed: false }
      }

      static getDerivedStateFromError() {
        return { failed: true }
      }

      componentDidCatch(error) {
        try { console.warn('[session-beacon] UI failed; beacon hidden for this page', error) } catch { /* ignore */ }
      }

      render() {
        return this.state.failed ? null : this.props.children
      }
    }

    function Badge({ row, t, onOpen, onPreviewEnter, onPreviewLeave, describedBy }) {
      const label = statusLabel(row, t)
      return h('button', {
        type: 'button',
        className: 'dsb-badge',
        'data-kind': row.kind,
        'data-current': row.current ? '1' : '0',
        title: `${row.title} · ${label}${row.current ? ` · ${t('current')}` : ''}`,
        'aria-label': `${t('openNamed', { title: row.title })}, ${label}`,
        'aria-describedby': describedBy,
        onClick: () => onOpen(row.id),
        onPointerEnter: event => onPreviewEnter(event, row),
        onPointerLeave: onPreviewLeave,
        onMouseEnter: event => onPreviewEnter(event, row),
        onMouseLeave: onPreviewLeave,
        onFocus: event => onPreviewEnter(event, row),
        onBlur: onPreviewLeave,
      },
        h('span', { className: 'dsb-dot', 'data-kind': row.kind, 'aria-hidden': 'true' }),
        h('span', { className: 'dsb-title' }, row.title))
    }

    function LauncherDots({ rows, t }) {
      const active = rows.filter(row => row.kind !== 'idle').slice(0, 4)
      if (active.length === 0) {
        return h('span', { className: 'dsb-launcherDots' },
          h('span', { className: 'dsb-dot', 'data-kind': 'idle', 'aria-hidden': 'true', title: t('idle') }))
      }
      return h('span', { className: 'dsb-launcherDots' },
        active.map(row => h('span', {
          key: row.id,
          className: 'dsb-launcherDot',
          title: `${row.title} · ${statusLabel(row, t)}`,
        }, h('span', { className: 'dsb-dot', 'data-kind': row.kind, 'aria-hidden': 'true' }))))
    }

    function BeaconLauncherBody(props) {
      const { useSessions, useSessionStatus, t: tProp } = props
      const t = typeof tProp === 'function' ? tProp : fallbackT()
      const list = useSessions(state => state)
      const statusById = useSessionStatus(state => state)
      const snapshot = useBeaconState()
      const rows = React.useMemo(() => buildRows(list, statusById), [list, statusById])
      React.useEffect(() => () => {
        beaconStore.cancelClose()
        if (beaconStore.state.barOpen || beaconStore.state.panelOpen) {
          beaconStore.update({ barOpen: false, barHovered: false, panelOpen: false })
        }
      }, [])
      if (rows.length === 0) return null
      const activeRows = rows.filter(row => row.kind !== 'idle')
      const waitingCount = activeRows.filter(row => row.kind === 'waiting').length
      const runningCount = activeRows.filter(row => row.kind === 'running').length
      const endedCount = activeRows.filter(row => row.kind === 'ended').length
      const summary = activeRows.length > 0
        ? [
          waitingCount > 0 ? `${waitingCount} ${t('waiting')}` : '',
          runningCount > 0 ? `${runningCount} ${t('running')}` : '',
          endedCount > 0 ? `${endedCount} ${t('ended')}` : '',
        ].filter(Boolean).join(' · ')
        : t('idleCount', { n: rows.filter(row => row.kind === 'idle').length })
      const primaryKind = waitingCount > 0 ? 'waiting' : endedCount > 0 ? 'ended' : runningCount > 0 ? 'running' : 'idle'
      const anchorOf = target => {
        const rect = target.getBoundingClientRect()
        return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom }
      }
      const showBar = event => {
        beaconStore.cancelClose()
        beaconStore.update({ barOpen: true, barHovered: false, anchor: anchorOf(event.currentTarget) })
      }
      const hideBar = () => {
        beaconStore.update({ barHovered: false })
        beaconStore.scheduleClose()
      }
      const togglePanel = event => {
        const anchor = anchorOf(event.currentTarget)
        beaconStore.cancelClose()
        if (beaconStore.state.panelOpen) {
          beaconStore.update({ panelOpen: false, barOpen: true, anchor })
          return
        }
        beaconStore.update({ barOpen: true, panelOpen: true, anchor, opener: event.currentTarget })
      }
      return h('button', {
        type: 'button',
        className: 'dsb-launcher',
        title: summary,
        'aria-label': `${t('expand')}: ${summary}`,
        'aria-haspopup': 'dialog',
        'aria-expanded': snapshot.panelOpen,
        'aria-controls': snapshot.panelOpen ? ALL_SESSIONS_ID : undefined,
        onMouseEnter: showBar,
        onMouseLeave: hideBar,
        onClick: togglePanel,
      },
        primaryKind === 'running' ? h('span', { className: 'dsb-launcherHalo', 'aria-hidden': 'true' }) : null,
        h('span', { className: 'dsb-launcherGlyph', 'data-kind': primaryKind }, h(BeaconGlyph, { size: 18 })))
    }

    function SessionBeaconLauncher(props) {
      if (typeof props.useSessions !== 'function' || typeof props.useSessionStatus !== 'function') return null
      return h(BeaconBoundary, null, h(BeaconLauncherBody, props))
    }

    function BeaconOverlayBody(props) {
      const { useSessions, useSessionStatus, ctx, t: tProp } = props
      const t = typeof tProp === 'function' ? tProp : fallbackT()
      const list = useSessions(state => state)
      const statusById = useSessionStatus(state => state)
      const snapshot = useBeaconState()
      const rows = React.useMemo(() => buildRows(list, statusById), [list, statusById])
      const [now, setNow] = React.useState(() => Date.now())
      const [notice, setNotice] = React.useState('')
      const panelRef = React.useRef(null)
      const wasPanelOpenRef = React.useRef(false)
      const suppressFocusReturnRef = React.useRef(false)
      const noticeTimerRef = React.useRef(null)

      const activeRows = rows.filter(row => row.kind !== 'idle')
      const idleRows = rows.filter(row => row.kind === 'idle')
      const currentRow = rows.find(row => row.current)
      const barRows = [
        ...(currentRow === undefined ? [] : [currentRow]),
        ...activeRows.filter(row => !row.current),
      ]
      const visibleRows = barRows.slice(0, 6)
      const hiddenActive = barRows.length - visibleRows.length

      React.useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 30_000)
        return () => {
          clearInterval(timer)
          if (noticeTimerRef.current !== null) clearTimeout(noticeTimerRef.current)
        }
      }, [])

      React.useEffect(() => {
        if (snapshot.panelOpen) {
          wasPanelOpenRef.current = true
          const first = panelRef.current?.querySelector('[data-dsb-row]')
          if (first && typeof first.focus === 'function') first.focus()
          return
        }
        if (wasPanelOpenRef.current) {
          wasPanelOpenRef.current = false
          if (!suppressFocusReturnRef.current) {
            const opener = snapshot.opener
            if (opener && opener.isConnected && typeof opener.focus === 'function') opener.focus()
          }
          suppressFocusReturnRef.current = false
          if (snapshot.barOpen) beaconStore.scheduleClose()
        }
      }, [snapshot.panelOpen, snapshot.opener, snapshot.barOpen])

      React.useEffect(() => {
        if (!snapshot.panelOpen) return undefined
        const onPointerDown = event => {
          const panel = panelRef.current
          if (panel !== null && panel.contains(event.target)) return
          const opener = snapshot.opener
          if (opener !== null && opener.contains?.(event.target)) return
          suppressFocusReturnRef.current = true
          beaconStore.update({ panelOpen: false })
        }
        const onKeyDown = event => {
          if (event.key === 'Escape') beaconStore.update({ panelOpen: false })
        }
        document.addEventListener('pointerdown', onPointerDown, true)
        document.addEventListener('keydown', onKeyDown, true)
        return () => {
          document.removeEventListener('pointerdown', onPointerDown, true)
          document.removeEventListener('keydown', onKeyDown, true)
        }
      }, [snapshot.panelOpen, snapshot.opener])

      const flashNotice = message => {
        setNotice(message)
        if (noticeTimerRef.current !== null) clearTimeout(noticeTimerRef.current)
        noticeTimerRef.current = setTimeout(() => {
          noticeTimerRef.current = null
          setNotice('')
        }, 4_000)
      }

      const open = sessionId => {
        suppressFocusReturnRef.current = true
        beaconStore.update({ barOpen: false, barHovered: false, panelOpen: false })
        if (!openSession(ctx, sessionId)) flashNotice(t('openFailed'))
      }

      const togglePanel = event => {
        beaconStore.cancelClose()
        if (beaconStore.state.panelOpen) {
          beaconStore.update({ panelOpen: false })
          return
        }
        beaconStore.update({ panelOpen: true, opener: event.currentTarget })
      }

      const barEnter = () => {
        beaconStore.cancelClose()
        if (!beaconStore.state.barHovered) beaconStore.update({ barHovered: true })
      }
      const barLeave = () => {
        beaconStore.update({ barHovered: false })
        beaconStore.scheduleClose()
      }

      const bar = snapshot.barOpen && snapshot.anchor !== null
        ? h('div', { className: 'dsb-bar', role: 'group', 'aria-label': t('allSessions'), onMouseEnter: barEnter, onMouseLeave: barLeave },
          h('button', {
            type: 'button', className: 'dsb-brand',
            title: `${t('beacon')} · ${t('allSessions')}`,
            'aria-label': `${t('beacon')}: ${t('allSessions')}`,
            'aria-haspopup': 'dialog',
            'aria-expanded': snapshot.panelOpen,
            onClick: togglePanel,
          }, h('span', { className: 'dsb-icon' }, h(BeaconGlyph, { size: 15 }))),
          h('div', { className: 'dsb-badges' },
            visibleRows.map(row => h('button', {
              type: 'button', key: row.id, className: 'dsb-badge', 'data-kind': row.kind,
              'data-current': row.current ? '1' : '0',
              'aria-current': row.current ? 'true' : undefined,
              title: `${row.title} · ${statusLabel(row, t)}${row.current ? ` · ${t('current')}` : ''}`,
              'aria-label': `${t('openNamed', { title: row.title })}, ${statusLabel(row, t)}${row.current ? `, ${t('current')}` : ''}`,
              onClick: () => open(row.id),
            },
              h('span', { className: 'dsb-dot', 'data-kind': row.kind, 'aria-hidden': 'true' }),
              h('span', { className: 'dsb-title' }, row.title),
              row.current ? h('span', { className: 'dsb-currentTag' }, t('current')) : null))),
          hiddenActive > 0
            ? h('button', { type: 'button', className: 'dsb-chip', title: t('allSessions'), onClick: togglePanel }, `+${hiddenActive}`)
            : null,
          idleRows.filter(row => !row.current).length > 0
            ? h('button', { type: 'button', className: 'dsb-chip', title: t('allSessions'), onClick: togglePanel },
              h('span', { className: 'dsb-dot', 'data-kind': 'idle', 'aria-hidden': 'true' }),
              String(idleRows.filter(row => !row.current).length))
            : null)
        : null

      const panel = snapshot.panelOpen
        ? h('div', { ref: panelRef, id: ALL_SESSIONS_ID, className: 'dsb-panel', role: 'dialog', 'aria-modal': 'false', 'aria-label': t('allSessions') },
          h('div', { className: 'dsb-panelHead' },
            h('strong', null, t('allSessions')),
            h('span', null, t('sessionsCount', { n: rows.length }))),
          h('div', { className: 'dsb-panelList' },
            rows.map(row => {
              const labelText = statusLabel(row, t)
              const time = relativeTime(row.updatedAt, now, t)
              const meta = time === '' ? labelText : `${labelText} · ${time}`
              return h('button', {
                type: 'button', key: row.id, className: 'dsb-row', 'data-kind': row.kind, 'data-dsb-row': 'true',
                title: `${row.title} · ${meta}${row.cwd ? ` · ${row.cwd}` : ''}`,
                'aria-label': `${t('openNamed', { title: row.title })}, ${meta}`,
                onClick: () => open(row.id),
              },
                h('span', { className: 'dsb-dot', 'data-kind': row.kind, 'aria-hidden': 'true' }),
                h('span', { className: 'dsb-rowMain' },
                  h('span', { className: 'dsb-rowTitle' }, row.title),
                  h('span', { className: 'dsb-rowMeta' }, meta)),
                row.current ? h('span', { className: 'dsb-tag' }, t('current')) : null)
            })))
        : null

      const show = snapshot.anchor !== null && (bar !== null || panel !== null || notice !== '')
      const popover = show
        ? h('div', {
          className: 'dsb-wrap',
          style: {
            left: `${Math.min(Math.max(16, snapshot.anchor.left), Math.max(16, window.innerWidth - 788))}px`,
            top: `${snapshot.anchor.bottom + 10}px`,
          },
        },
          bar,
          panel,
          notice === '' ? null : h('div', { className: 'dsb-notice', role: 'status' }, notice))
        : null

      return h(React.Fragment, null,
        h('style', null, CSS),
        popover)
    }

    function SessionBeaconOverlay(props) {
      if (typeof props.useSessions !== 'function' || typeof props.useSessionStatus !== 'function') return null
      return h(BeaconBoundary, null, h(BeaconOverlayBody, props))
    }

    function installLocales(ctx) {
      const locale = ctx?.locale
      if (!locale || typeof locale.register !== 'function') return () => {}
      const disposers = []
      const register = (id, dict) => {
        try {
          const dispose = locale.register(NS, id, dict)
          if (typeof dispose === 'function') disposers.push(dispose)
        } catch (error) {
          try { console.warn(`[session-beacon] locale "${id}" registration failed`, error) } catch { /* ignore */ }
        }
      }
      register('en', en)
      let snapshot
      try {
        if (typeof locale.getLocale === 'function') snapshot = locale.getLocale()
      } catch (error) {
        try { console.warn('[session-beacon] locale catalog unavailable', error) } catch { /* ignore */ }
      }
      const ids = Array.isArray(snapshot?.locales) ? snapshot.locales.map(entry => String(entry?.id ?? '')).filter(Boolean) : []
      const zhIds = new Set(['zh'])
      for (const id of ids) if (/^zh/i.test(id)) zhIds.add(id)
      for (const id of zhIds) register(id, zh)
      return () => {
        for (const dispose of disposers) {
          try { dispose() } catch { /* ignore */ }
        }
      }
    }

    function safeBind(ctx) {
      try {
        if (typeof ctx?.locale?.bind === 'function') {
          const bound = ctx.locale.bind(NS)
          if (typeof bound === 'function') return bound
        }
      } catch { /* ignore */ }
      return null
    }

    const inject = ['slots', 'locale']

    function apply(ctx) {
      try {
        ctx.effect(() => installLocales(ctx), 'session-beacon: localized labels')
      } catch (error) {
        try { console.warn('[session-beacon] locale setup skipped', error) } catch { /* ignore */ }
      }

      const translate = safeBind(ctx) ?? fallbackT()

      const register = (slot, id, order, Component) => {
        try {
          ctx.slots.inject(slot, () => {
            let dispose
            try {
              dispose = ctx.slots.register({
                name: slot,
                id,
                order,
                label: () => translate('beacon'),
                locale: NS,
              }, props => h(Component, { ...props, ctx }))
            } catch (error) {
              try { console.warn(`[session-beacon] slot registration failed (${slot})`, error) } catch { /* ignore */ }
              return () => {}
            }
            return () => {
              try { dispose() } catch { /* ignore */ }
            }
          })
        } catch (error) {
          try { console.warn(`[session-beacon] slot unavailable (${slot})`, error) } catch { /* ignore */ }
        }
      }

      register('conversation.session.header.actions', 'session-beacon', -1000, SessionBeaconLauncher)
      register('shell.overlay', 'session-beacon-popover', 30, SessionBeaconOverlay)
    }

    return { inject, apply }
  },
})
