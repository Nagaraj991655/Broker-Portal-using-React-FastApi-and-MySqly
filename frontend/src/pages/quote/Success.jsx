// pages/quote/Success.jsx — Final confirmation page
//
// WHAT IS THIS PAGE?
// Shown after the user clicks "Send Quote" on the Review page.
// It tells them the quote has been submitted to the underwriter.
//
// HOW IT WORKS:
// 1. Read the submission number from sessionStorage
// 2. Show a green checkmark with a success message
// 3. "Back to Dashboard" button clears sessionStorage and navigates home

import { useNavigate } from 'react-router-dom'

export default function Success() {

  const navigate = useNavigate()
  const submissionNo = sessionStorage.getItem('submissionNo')

  function handleBackToDashboard() {
    sessionStorage.clear()
    navigate('/')
  }


 
  return (
    <div style={{ maxWidth: 600, margin: '60px auto', padding: '24px 16px', textAlign: 'center' }}>

      {/* Tick Button in green*/}
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: '#dcfce7',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px',
      }}>
        <span style={{ fontSize: 36, color: '#16a34a', fontWeight: 700 }}>✓</span>
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
        Quote sent successfully
      </h2>
      <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, marginBottom: 8 }}>
        Your quote <strong>{submissionNo}</strong> has been submitted for review.
      </p>
      <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, marginBottom: 32 }}>
        An underwriter will review the details and get back to you shortly.
      </p>

      {/* Back to Dashboard button */}
      <button
        onClick={handleBackToDashboard}
        style={{
          background: '#010c3f',
          color: 'white',
          border: 'none',
          borderRadius: 10,
          padding: '10px 28px',
          fontSize: 13,
          cursor: 'pointer',
        }}
      >
        Back to Dashboard
      </button>

    </div>
  )
}