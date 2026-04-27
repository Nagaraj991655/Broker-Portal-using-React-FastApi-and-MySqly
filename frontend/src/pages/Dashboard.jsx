// pages/Dashboard.jsx — The home page
//
// WHAT IS THIS PAGE?
// This is the first page users see when they open the app.
// It shows a table of all insurance submissions with their status and date.
// There's also a "New Submission" button that starts the quote flow.
//
// HOW IT WORKS:
// 1. When the page loads, useEffect calls listSubmissions() from api.js
// 2. The backend returns an array of submissions
// 3. We store them in state and display them in a table
// 4. While waiting for the backend, we show "Loading submissions..."
// 5. If there are no submissions yet, we show an empty state message

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listSubmissions } from '../services/api'


// ── Status colors ───────────────────────────────────────────────
// Maps submission status to background and text colors.
// Used for the colored pill in the Status column.
var statusColors = {
  InProgress: { background: '#ffe6c0', color: '#f0a500' },   
  QuoteSent: { background: '#d2b2f1', color: '#a855f7' },   
}




// ── Main Component ──────────────────────────────────────────────
export default function Dashboard() {

  // navigate lets us send the user to a different page
  var navigate = useNavigate()

  // submissions = the list of submissions fetched from the backend
  var [submissions, setSubmissions] = useState([])

  // isLoading is true while we wait for the backend to respond
  var [isLoading, setIsLoading] = useState(true)


  // ── Fetch submissions when the page loads ───────────────────
  // useEffect with an empty [] runs ONCE when the component first appears
  useEffect(function() {

    listSubmissions()
      .then(function(response) {
        // Success — store the submissions in state
        setSubmissions(response.data)
      })
      .catch(function() {
        // If the backend is not running, just show an empty list
        setSubmissions([])
      })
      .finally(function() {
        // Whether success or error, stop showing "Loading..."
        setIsLoading(false)
      })

  }, [])


  // ── Handle "New Submission" button click ────────────────────
  function handleNewSubmission() {
    navigate('/quote/customer')
  }


  // ── Style helpers ───────────────────────────────────────────
  var thStyle = {
    padding: '10px 14px',
    textAlign: 'left',
    fontWeight: 500,
    color: '#64748b',
    fontSize: 12,
    borderBottom: '1px solid #f1f5f9',
  }

  var tdStyle = {
    padding: '12px 14px',
  }


  // ── Render ──────────────────────────────────────────────────
  return (
    <div>

      {/* ── Page Header ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
      }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>
            Submissions
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            All motor insurance submissions
          </p>
        </div>

        {/* New Submission button */}
        <button
          onClick={handleNewSubmission}
          style={{
            background: '#1a6b4a',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            padding: '9px 18px',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          + New Submission
        </button>
      </div>


      {/* ── Loading State ── */}
      {isLoading && (
        <p style={{ color: '#94a3b8', fontSize: 13 }}>Loading submissions...</p>
      )}


      {/* ── Empty State ── */}
      {!isLoading && submissions.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
          <p>No submissions yet. Start a new quote.</p>
        </div>
      )}


      {/* ── Submissions Table ── */}
      {!isLoading && submissions.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>

          {/* Table header row */}
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={thStyle}>Submission No</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>

          {/* Table body — one row per submission */}
          <tbody>
            {submissions.map(function(submission) {
              var colors = statusColors[submission.status] || { background: '#f8fafc', color: '#475569' }
              return (
                <tr key={submission.id} style={{ borderBottom: '1px solid #f8fafc' }}>

                  {/* Submission number e.g. Q-00001 */}
                  <td style={{ ...tdStyle, fontWeight: 500 }}>
                    {submission.submission_no}
                  </td>

                  {/* Status badge with color */}
                  
                  <td style={tdStyle}>
                     <span style={{
                       color: colors.color,
                       padding: '3px 10px',
                       borderRadius: 20,
                       fontSize: 11,
                       fontWeight: 500,
                       background: colors.background,
                      }}>
            {submission.status}
          </span>
                  </td>

                  {/* Date the submission was created */}
              
                  {/* View button */}
                  <td style={tdStyle}>
                    <button style={{
                      background: '#1a6b4a',
                      border: '1px solid #1a6b4a',
                      borderRadius: 3,
                      padding: '4px 10px',
                      fontSize: 12,
                      cursor: 'pointer',
                      color: '#ffffff',
                    }}>
                      View
                    </button>
                  </td>

                </tr>
              )
            })}
          </tbody>

        </table>
      )}

    </div>
  )
}