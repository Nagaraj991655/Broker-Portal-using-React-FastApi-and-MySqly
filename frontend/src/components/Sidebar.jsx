import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'


var navigationLinks = [
  { path: '/',               icon: '📈', label: 'Dashboard' },
  { path: '/quote/customer', icon: '🆕', label: 'New Quote'  },
]

export default function Sidebar() {
  var [isOpen, setIsOpen] = useState(true)
  var location = useLocation()

  // Toggle between open and closed
  function handleToggle() {
    setIsOpen(function(previousValue) {
      return !previousValue    // flip true→false or false→true
    })
  }

  return (
    <div
      style={{
        width: isOpen ? 250 : 65,        
        background: '#110d49',            // dark purple background
        minHeight: '100vh',               // full height of the screen
        padding: '16px 12px',
        flexShrink: 0,                    // don't let the sidebar shrink
        overflow: 'hidden',               // hide text that overflows when collapsed
        transition: 'width 1s ease',      // smooth animation when toggling
      }}
    >

      {/* ── Hamburger Button (3 horizontal lines) ── */}
      {/* Clicking this toggles the sidebar open/closed */}
      <button
        onClick={handleToggle}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          marginBottom: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
        }}
      >
        {/* Each span is one horizontal line of the hamburger icon */}
        <span style={{ display: 'block', width: 22, height: 2, background: 'rgb(231, 232, 233)', borderRadius: 2 }} />
        <span style={{ display: 'block', width: 22, height: 2, background: 'rgb(231, 232, 233)', borderRadius: 2 }} />
        <span style={{ display: 'block', width: 22, height: 2, background: 'rgb(231, 232, 233)', borderRadius: 2 }} />
      </button>

      {/* ── App Name (only visible when sidebar is open) ── */}
      {isOpen && (
        <div style={{ marginBottom: 24, paddingLeft: 4 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'white', marginLeft: 5, marginTop: 30 }}>
            Motor Insurance
          </div>
          <div style={{ fontSize: 11, color: '#c9d3e0', marginTop: 5, marginLeft: 5 }}>
            Broker Portal
          </div>
        </div>
      )}

      {/* ── Navigation Links ── */}
      {/* Loop through each link and display it */}
      {navigationLinks.map(function(link) {

        // Check if this link matches the current page URL
        // If yes, we'll highlight it (white background, dark text)
        var isActiveLink = (location.pathname === link.path)

        return (
          <Link
            key={link.path}
            to={link.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              padding: '9px 8px',
              marginBottom: 4,
              borderRadius: 6,
              textDecoration: 'none',          // no underline
              // Active link = dark text on white background
              // Other links = white text on transparent background
              color:      isActiveLink ? '#1a1246' : '#ffffff',
              background: isActiveLink ? '#f1f1f1' : '',
              fontWeight: isActiveLink ? 600 : 400,
            }}
          >
            {/* When sidebar is collapsed, show the icon */}
            {!isOpen && (
              <span style={{ fontSize: 13 }}>
                {link.icon}
              </span>
            )}

            {/* When sidebar is open, show the label text */}
            {isOpen && (
              <span style={{ fontSize: 14 }}>
                {link.label}
              </span>
            )}
          </Link>
        )
      })}

    </div>
  )
}
