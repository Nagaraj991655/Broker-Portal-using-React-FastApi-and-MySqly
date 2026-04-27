var STATUSES = {
  InProgress: {
    label: 'In Progress',
    color: '#f0a500',
    bg:    '#fef3e2',
    text:  '#925e00',
  },
  QuoteSent: {
    label: 'Quote - Sent',
    color: '#a855f7',
    bg:    '#faf5ff',
    text:  '#7e22ce',
  },
}


export default function StatusBadge({ statusKey }) {


  var status = STATUSES[statusKey] || {
    label: statusKey,
    color: '#94a3b8',
    bg:    '#f8fafc',
    text:  '#475569',
  }

  return (
    <div
      style={{
        display:      'inline-flex',
        alignItems:   'center',
        gap:          6,
        background:   status.bg,
        border:       '1px solid ' + status.color,
        borderRadius: 6,
        padding:      '4px 12px',
        fontSize:     12,
        color:        status.text,
      }}
    >
      {/* Colored dot */}
      <span style={{
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: status.color,
        display: 'inline-block',
        flexShrink: 0,
      }} />
      {status.label}
    </div>
  )
}