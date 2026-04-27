// pages/quote/PlanDeatils.jsx — Step 3 of the quote flow
//
// WHAT IS THIS PAGE?
// The user picks a policy start date and selects one of the three plans
// (Basic, Plus, Elite). When they click "Next", the plan choice is saved
// to the backend and they move to Step 4 (Review & Quote).

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StepBar from '../../components/StepBar'
import StatusBadge from '../../components/StatusBadge'
import { savePlan } from '../../services/api'

// The 5 steps shown in the progress bar at the top
var QUOTE_STEPS = [
  'Customer Details',
  'Vehicle Details',
  'Select Plan',
  'Review & Quote',
  'Payment',
]


// ── Helper: get today as YYYY-MM-DD ─────────────────────────────
function getTodayString() {
  let today = new Date()
  let year  = today.getFullYear()
  let month = String(today.getMonth() + 1).padStart(2, '0')
  let day   = String(today.getDate()).padStart(2, '0')
  return year + '-' + month + '-' + day
}


// ── Helper: get max date (today + 90 days) ──────────────────────
function getMaxDateString() {
  let future = new Date()
  future.setDate(future.getDate() + 90)
  let year  = future.getFullYear()
  let month = String(future.getMonth() + 1).padStart(2, '0')
  let day   = String(future.getDate()).padStart(2, '0')
  return year + '-' + month + '-' + day
}


// ── Helper: add 1 year to a date string ────────────────────────
function addOneYear(dateString) {
  let d = new Date(dateString)
  d.setFullYear(d.getFullYear() + 1)
  let year  = d.getFullYear()
  let month = String(d.getMonth() + 1).padStart(2, '0')
  let day   = String(d.getDate()).padStart(2, '0')
  return year + '-' + month + '-' + day
}


// ── Helper: format date as DD/MM/YYYY for display ──────────────
function formatDate(dateStr) {
  if (!dateStr) return '';

  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}





// ── Main Component ──────────────────────────────────────────────
export default function PlanDetails() {

  const navigate = useNavigate()

  // Read the submission ID saved by previous steps
  const submissionId = sessionStorage.getItem('submissionId')

  // errors holds validation messages
  const [errors, setErrors] = useState({})

  // isSaving is true while we wait for the backend
  const [isSaving, setIsSaving] = useState(false)

  // form holds everything the user picks on this page
  const [form, setForm] = useState({
    policyStart:  getTodayString(),
    selectedPlan: '',
  })

  // Policy end is always start + 1 year (not stored in state — calculated)
  let policyEnd = form.policyStart ? addOneYear(form.policyStart) : ''

  // Redirect if no submission ID (user skipped Steps 1-2)
  useEffect(function() {
    if (!submissionId) {
      navigate('/quote/customer')
    }
  }, [submissionId, navigate])


  // Validation 
  function validatePage() {
    let newErrors = {}

    if (!form.policyStart) {
      newErrors.policyStart = 'Please select a policy start date'
    }
    if (!form.selectedPlan) {
      newErrors.selectedPlan = 'Please select a plan'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }


  // ── Handle Back ───────────────────────────────────────────────
  function handleBack() {
    navigate('/quote/vehicle')
  }


  // ── Handle Next ───────────────────────────────────────────────
  async function handleNextPage() {

    // Stop if validation fails
    let isValid = validatePage()
    if (!isValid) return

    setIsSaving(true)

    try {
      // Find the price for the chosen plan
      var prices = { basic: 145.00, plus: 280.00, elite: 430.00 }
      var premium = prices[form.selectedPlan]

      // Send to backend
      await savePlan(submissionId, {
        plan:         form.selectedPlan,
        premium:      premium,
        policy_start: form.policyStart,
      })

      navigate('/quote/review')

    } catch {
      alert('Error saving plan. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }


  // ── Helper: input style with optional red border ──────────────
  function getInputStyle(fieldName) {
    var hasError = errors[fieldName]
    return {
      padding: '8px 10px',
      fontSize: 13,
      borderRadius: 6,
      width: '100%',
      border: '1px solid ' + (hasError ? '#dc2626' : '#e2e8f0'),
      outline: 'none',
      background: 'white',
      color: '#0f172a',
    }
  }


  // ── Render ────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>

      {/* progress bar */}
      <StepBar steps={QUOTE_STEPS} current={2} />

      {/* Status */}
      <StatusBadge statusKey="InProgress" />

      
      <h3 style={{ fontSize: 15, fontWeight: 600, margin: '24px 0 16px', paddingBottom: 8 }}>
        Policy period
      </h3>

     
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 24 }}>

       
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#334155', marginBottom: 4 }}>
            Policy start date <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="date"
            style={getInputStyle('policyStart')}
            value={form.policyStart}
            min={getTodayString()}
            max={getMaxDateString()}
            onChange={function(e) { setForm({ ...form, policyStart: e.target.value }) }}
          />
          {errors.policyStart && (
            <span style={{ color: '#ef4444', fontSize: 11, display: 'block', marginTop: 2 }}>
              {errors.policyStart}
            </span>
          )}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#334155', marginBottom: 4 }}>
            Policy end date
          </label>
          <div style={{ padding: '8px 10px', fontSize: 13, color: '#475569', fontWeight: 500 }}>
            {policyEnd ? formatDate(policyEnd) : '—'}
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px', paddingBottom: 8 }}>
        Select a plan
      </h3>
      {errors.selectedPlan && (
        <div style={{ color: '#dc2626', fontSize: 12, marginBottom: 12, padding: '6px 12px', background: '#fef2f2', borderRadius: 6 }}>
          {errors.selectedPlan}
        </div>
      )}

      {/* 3 Cards*/}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>

        {/* BASIC Plan */}
        <div
          onClick={function() { setForm({ ...form, selectedPlan: 'basic' }) }}
          style={{
            border: form.selectedPlan === 'basic' ? '2px solid #0f8a65' : '1px solid #e2e8f0',
            borderRadius: 12,
            overflow: 'hidden',
            cursor: 'pointer',
            background: 'white',
          }}
        >
          <div style={{ background: '#ffffff', padding: '20px 16px 16px', textAlign: 'center' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              border: form.selectedPlan === 'basic' ? 'none' : '2px solid #e2e8f0',
              background: form.selectedPlan === 'basic' ? '#0f8a65' : 'transparent',
              margin: '0 auto 10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {form.selectedPlan === 'basic' && <span style={{ color: 'white', fontSize: 16 }}>✓</span>}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>MotorShield</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Basic</div>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12, lineHeight: 1.4 }}>
              Essential protection for everyday drivers.
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#0f172a' }}>
              <span style={{ fontSize: 16, fontWeight: 500 }}>$ </span>145.00
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>/year</div>
          </div>

          {/* Basic benefits */}
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, color: '#0f172a' }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: '#dcfce7', color: '#16a34a' }}>✓</span>
              Third-party liability
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, color: '#0f172a' }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: '#dcfce7', color: '#16a34a' }}>✓</span>
              Personal accident
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, color: '#0f172a' }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: '#dcfce7', color: '#16a34a' }}>✓</span>
              Basic roadside assistance
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, color: '#94a3b8' }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: '#fee2e2', color: '#dc2626' }}>✕</span>
              Own damage protection
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, color: '#94a3b8' }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: '#fee2e2', color: '#dc2626' }}>✕</span>
              Extended roadside assistance
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, color: '#94a3b8' }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: '#fee2e2', color: '#dc2626' }}>✕</span>
              Theft coverage
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, color: '#94a3b8' }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: '#fee2e2', color: '#dc2626' }}>✕</span>
              Zero deprecation
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, color: '#94a3b8' }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: '#fee2e2', color: '#dc2626' }}>✕</span>
              Engine protection
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, color: '#94a3b8' }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: '#fee2e2', color: '#dc2626' }}>✕</span>
              Concierge services
            </div>
          </div>
        </div>


        {/* PLUS Plan */}
        <div
          onClick={function() { setForm({ ...form, selectedPlan: 'plus' }) }}
          style={{
            border: form.selectedPlan === 'plus' ? '2px solid #0f8a65' : '1px solid #e2e8f0',
            borderRadius: 12,
            overflow: 'hidden',
            cursor: 'pointer',
            background: 'white',
          }}
        >
          <div style={{ background: '#ffffff', padding: '20px 16px 16px', textAlign: 'center' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              border: form.selectedPlan === 'plus' ? 'none' : '2px solid #e2e8f0',
              background: form.selectedPlan === 'plus' ? '#0f8a65' : 'transparent',
              margin: '0 auto 10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {form.selectedPlan === 'plus' && <span style={{ color: 'white', fontSize: 16 }}>✓</span>}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>MotorShield</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Plus</div>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12, lineHeight: 1.4 }}>
              Enhanced coverage for the peace of mind.
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#0f172a' }}>
              <span style={{ fontSize: 16, fontWeight: 500 }}>$ </span>280.00
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>/year</div>
          </div>

          {/* Plus benefits */}
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, color: '#0f172a' }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: '#dcfce7', color: '#16a34a' }}>✓</span>
              Third-party liability
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, color: '#0f172a' }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: '#dcfce7', color: '#16a34a' }}>✓</span>
              Personal accident
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, color: '#0f172a' }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: '#dcfce7', color: '#16a34a' }}>✓</span>
              Basic roadside assistance
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, color: '#0f172a' }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: '#dcfce7', color: '#16a34a' }}>✓</span>
              Own damage protection
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, color: '#0f172a' }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: '#dcfce7', color: '#16a34a' }}>✓</span>
              Extended roadside assistance
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, color: '#0f172a' }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: '#dcfce7', color: '#16a34a' }}>✓</span>
              Theft coverage
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, color: '#94a3b8' }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: '#fee2e2', color: '#dc2626' }}>✕</span>
              Zero deprecation
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, color: '#94a3b8' }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: '#fee2e2', color: '#dc2626' }}>✕</span>
              Engine protection
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, color: '#94a3b8' }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: '#fee2e2', color: '#dc2626' }}>✕</span>
              Concierge services
            </div>
          </div>
        </div>


        {/* ELITE Plan */}
        <div
          onClick={function() { setForm({ ...form, selectedPlan: 'elite' }) }}
          style={{
            border: form.selectedPlan === 'elite' ? '2px solid #0f8a65' : '1px solid #e2e8f0',
            borderRadius: 12,
            overflow: 'hidden',
            cursor: 'pointer',
            background: 'white',
          }}
        >
          <div style={{ background: '#ffffff', padding: '20px 16px 16px', textAlign: 'center' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              border: form.selectedPlan === 'elite' ? 'none' : '2px solid #e2e8f0',
              background: form.selectedPlan === 'elite' ? '#0f8a65' : 'transparent',
              margin: '0 auto 10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {form.selectedPlan === 'elite' && <span style={{ color: 'white', fontSize: 16 }}>✓</span>}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>MotorShield</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Elite</div>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12, lineHeight: 1.4 }}>
              Premium protection with all the perks.
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#0f172a' }}>
              <span style={{ fontSize: 16, fontWeight: 500 }}>$ </span>430.00
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>/year</div>
          </div>

          {/* Elite benefits */}
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, color: '#0f172a' }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: '#dcfce7', color: '#16a34a' }}>✓</span>
              Third-party liability
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, color: '#0f172a' }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: '#dcfce7', color: '#16a34a' }}>✓</span>
              Personal accident
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, color: '#0f172a' }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: '#dcfce7', color: '#16a34a' }}>✓</span>
              Basic roadside assistance
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, color: '#0f172a' }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: '#dcfce7', color: '#16a34a' }}>✓</span>
              Own damage protection
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, color: '#0f172a' }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: '#dcfce7', color: '#16a34a' }}>✓</span>
              Extended roadside assistance
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, color: '#0f172a' }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: '#dcfce7', color: '#16a34a' }}>✓</span>
              Theft coverage
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, color: '#0f172a' }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: '#dcfce7', color: '#16a34a' }}>✓</span>
              Zero deprecation
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, color: '#0f172a' }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: '#dcfce7', color: '#16a34a' }}>✓</span>
              Engine protection
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, color: '#0f172a' }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: '#dcfce7', color: '#16a34a' }}>✓</span>
              Concierge services
            </div>
          </div>
        </div>

      </div>


      {/* Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
        
        {/* Back Buttons */}
        <button onClick={handleBack} style={{
          background: '#010c3f', color: 'white', border: 'none',
          borderRadius: 10, padding: '10px 28px', fontSize: 13, cursor: 'pointer',
        }}>
          Back
        </button>

        {/* Next Buttons */}
        <button onClick={handleNextPage} disabled={isSaving} style={{
          background: isSaving ? '#2cd4b8' : '#010c3f', color: 'white', border: 'none',
          borderRadius: 10, padding: '10px 28px', fontSize: 13,
          cursor: isSaving ? 'not-allowed' : 'pointer',
        }}>
          {isSaving ? 'Saving...' : 'Next'}
        </button>

      </div>

    </div>
  )
}