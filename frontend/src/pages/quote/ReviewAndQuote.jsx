import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StepBar from '../../components/StepBar'
import StatusBadge from '../../components/StatusBadge'
import { getFullSubmission, sendQuote } from '../../services/api'

var QUOTE_STEPS = [
  'Customer Details',
  'Vehicle Details',
  'Select Plan',
  'Review & Quote',
  'Payment',
]


var PLAN_NAMES = {
  basic: 'MotorShield Basic',
  plus:  'MotorShield Plus',
  elite: 'MotorShield Elite',
}


function formatDate(dateStr) {
  if (!dateStr) return '';

  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}


function DetailRow({ label, value }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
        {value || '—'}
      </div>
    </div>
  )
}

function PolicyBoxRow({ label, value }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div>{label}</div>
      <strong style={{ color: '#0f172a' }}>{value || '—'}</strong>
    </div>
  )
}



export default function ReviewAndQuote() {

  const navigate = useNavigate()
  const submissionId = sessionStorage.getItem('submissionId')

  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)


  useEffect(function() {
    if (!submissionId) {
      navigate('/quote/customer')
      return
    }

    getFullSubmission(submissionId)
      .then(function(response) {
        setData(response.data)
      })
      .catch(function() {
        alert('Could not load submission data.')
      })
      .finally(function() {
        setIsLoading(false)
      })
  }, [submissionId, navigate])


  // Handle Back 
  function handleBack() {
    navigate('/quote/plan')
  }


  // Handle Next
  async function handleNextPage() {
    setIsSending(true)

    try {
      await sendQuote(submissionId)
      navigate('/quote/success')
    } catch {
      alert('Error sending quote. Please try again.')
      setIsSending(false)
    }
  }


  // For Loading state
  if (isLoading) {
    return (
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>
        <p style={{ color: '#94a3b8' }}>Loading submission...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>
        <p style={{ color: '#ef4444' }}>Could not load submission data.</p>
      </div>
    )
  }


  const customer = data.customer || {}
  const vehicle  = data.vehicle  || {}
  const quote    = data.quote    || {}


  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>

      {/* progress bar */}
      <StepBar steps={QUOTE_STEPS} current={3} />

      {/* Status  */}
      <StatusBadge statusKey="InProgress" />

  
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginTop: 24 }}>

        {/*  LEFT COLUMN  */}
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, paddingBottom: 8 }}>
            Personal details
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            <DetailRow label="First name"    value={customer.first_name} />
            <DetailRow label="Last name"     value={customer.last_name} />
            <DetailRow label="Gender"        value={customer.gender} />
            <DetailRow label="Date of birth" value={formatDate(customer.dob)} />
          </div>

          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, paddingBottom: 8 }}>
            Contact information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            <DetailRow label="E-mail"       value={customer.email} />
            <DetailRow label="Phone number" value={customer.phone} />
          </div>

          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, paddingBottom: 8 }}>
            Address
          </h3>
          <DetailRow label="Address line 1" value={customer.addr1} />
          <DetailRow label="Address line 2" value={customer.addr2} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <DetailRow label="City"             value={customer.city} />
            <DetailRow label="State / Province" value={customer.state} />
            <DetailRow label="Postal code"      value={customer.postal} />
            <DetailRow label="Country"          value={customer.country} />
          </div>

        </div>


        {/*  RIGHT COLUMN */}
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, paddingBottom: 8 }}>
            Policy details
          </h3>

          <div style={{
            background: '#dcfce7',
            borderRadius: 8,
            padding: '20px 24px',
            color: '#166534',
            fontSize: 13,
            lineHeight: 1.7,
          }}>

            <div style={{ marginBottom: 10 }}>
              Quote <strong style={{ color: '#0f172a' }}>{data.submission_no}</strong>
            </div>

            <PolicyBoxRow
              label="Policy period"
              value={formatDate(quote.policy_start) + ' – ' + formatDate(quote.policy_end)}
            />

            <PolicyBoxRow
              label="Insured vehicle"
              value={vehicle.year + ' ' + vehicle.make + ' ' + vehicle.model}
            />

            <PolicyBoxRow
              label="Mileage"
              value={ vehicle.mileage + " km"}
            />

            <PolicyBoxRow
              label="Estimated market value"
              value={ '$ ' + vehicle.estimatedMarketValue}
            />

            <PolicyBoxRow
              label="Selected plan"
              value={PLAN_NAMES[quote.plan]}
            />

            <PolicyBoxRow
              label="Annual premium"
              value={"$ "  +  "Yet to be Calculated" }
            />

      
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Benefits</div>

              {/* Basic plan benefits  */}
              {quote.plan === 'basic' && (
                <div>
                  <div style={{ fontSize: 12, marginBottom: 6, color: '#166534' }}>
                    <span style={{ color: '#16a34a', fontWeight: 700, marginRight: 6 }}>✓</span>
                    Third-party liability
                  </div>
                  <div style={{ fontSize: 12, marginBottom: 6, color: '#166534' }}>
                    <span style={{ color: '#16a34a', fontWeight: 700, marginRight: 6 }}>✓</span>
                    Personal accident
                  </div>
                  <div style={{ fontSize: 12, marginBottom: 6, color: '#166534' }}>
                    <span style={{ color: '#16a34a', fontWeight: 700, marginRight: 6 }}>✓</span>
                    Basic roadside assistance
                  </div>
                  <div style={{ fontSize: 12, marginBottom: 6, color: '#94a3b8' }}>
                    <span style={{ color: '#dc2626', fontWeight: 700, marginRight: 6 }}>✕</span>
                    Own damage protection
                  </div>
                  <div style={{ fontSize: 12, marginBottom: 6, color: '#94a3b8' }}>
                    <span style={{ color: '#dc2626', fontWeight: 700, marginRight: 6 }}>✕</span>
                    Extended roadside assistance
                  </div>
                  <div style={{ fontSize: 12, marginBottom: 6, color: '#94a3b8' }}>
                    <span style={{ color: '#dc2626', fontWeight: 700, marginRight: 6 }}>✕</span>
                    Theft coverage
                  </div>
                  <div style={{ fontSize: 12, marginBottom: 6, color: '#94a3b8' }}>
                    <span style={{ color: '#dc2626', fontWeight: 700, marginRight: 6 }}>✕</span>
                    Zero deprecation
                  </div>
                  <div style={{ fontSize: 12, marginBottom: 6, color: '#94a3b8' }}>
                    <span style={{ color: '#dc2626', fontWeight: 700, marginRight: 6 }}>✕</span>
                    Engine protection
                  </div>
                  <div style={{ fontSize: 12, marginBottom: 6, color: '#94a3b8' }}>
                    <span style={{ color: '#dc2626', fontWeight: 700, marginRight: 6 }}>✕</span>
                    Concierge services
                  </div>
                </div>
              )}

              {/* Plus plan */}
              {quote.plan === 'plus' && (
                <div>
                  <div style={{ fontSize: 12, marginBottom: 6, color: '#166534' }}>
                    <span style={{ color: '#16a34a', fontWeight: 700, marginRight: 6 }}>✓</span>
                    Third-party liability
                  </div>
                  <div style={{ fontSize: 12, marginBottom: 6, color: '#166534' }}>
                    <span style={{ color: '#16a34a', fontWeight: 700, marginRight: 6 }}>✓</span>
                    Personal accident
                  </div>
                  <div style={{ fontSize: 12, marginBottom: 6, color: '#166534' }}>
                    <span style={{ color: '#16a34a', fontWeight: 700, marginRight: 6 }}>✓</span>
                    Basic roadside assistance
                  </div>
                  <div style={{ fontSize: 12, marginBottom: 6, color: '#166534' }}>
                    <span style={{ color: '#16a34a', fontWeight: 700, marginRight: 6 }}>✓</span>
                    Own damage protection
                  </div>
                  <div style={{ fontSize: 12, marginBottom: 6, color: '#166534' }}>
                    <span style={{ color: '#16a34a', fontWeight: 700, marginRight: 6 }}>✓</span>
                    Extended roadside assistance
                  </div>
                  <div style={{ fontSize: 12, marginBottom: 6, color: '#166534' }}>
                    <span style={{ color: '#16a34a', fontWeight: 700, marginRight: 6 }}>✓</span>
                    Theft coverage
                  </div>
                  <div style={{ fontSize: 12, marginBottom: 6, color: '#94a3b8' }}>
                    <span style={{ color: '#dc2626', fontWeight: 700, marginRight: 6 }}>✕</span>
                    Zero deprecation
                  </div>
                  <div style={{ fontSize: 12, marginBottom: 6, color: '#94a3b8' }}>
                    <span style={{ color: '#dc2626', fontWeight: 700, marginRight: 6 }}>✕</span>
                    Engine protection
                  </div>
                  <div style={{ fontSize: 12, marginBottom: 6, color: '#94a3b8' }}>
                    <span style={{ color: '#dc2626', fontWeight: 700, marginRight: 6 }}>✕</span>
                    Concierge services
                  </div>
                </div>
              )}

              {/*  Elite plan benefits  */}
              {quote.plan === 'elite' && (
                <div>
                  <div style={{ fontSize: 12, marginBottom: 6, color: '#166534' }}>
                    <span style={{ color: '#16a34a', fontWeight: 700, marginRight: 6 }}>✓</span>
                    Third-party liability
                  </div>
                  <div style={{ fontSize: 12, marginBottom: 6, color: '#166534' }}>
                    <span style={{ color: '#16a34a', fontWeight: 700, marginRight: 6 }}>✓</span>
                    Personal accident
                  </div>
                  <div style={{ fontSize: 12, marginBottom: 6, color: '#166534' }}>
                    <span style={{ color: '#16a34a', fontWeight: 700, marginRight: 6 }}>✓</span>
                    Basic roadside assistance
                  </div>
                  <div style={{ fontSize: 12, marginBottom: 6, color: '#166534' }}>
                    <span style={{ color: '#16a34a', fontWeight: 700, marginRight: 6 }}>✓</span>
                    Own damage protection
                  </div>
                  <div style={{ fontSize: 12, marginBottom: 6, color: '#166534' }}>
                    <span style={{ color: '#16a34a', fontWeight: 700, marginRight: 6 }}>✓</span>
                    Extended roadside assistance
                  </div>
                  <div style={{ fontSize: 12, marginBottom: 6, color: '#166534' }}>
                    <span style={{ color: '#16a34a', fontWeight: 700, marginRight: 6 }}>✓</span>
                    Theft coverage
                  </div>
                  <div style={{ fontSize: 12, marginBottom: 6, color: '#166534' }}>
                    <span style={{ color: '#16a34a', fontWeight: 700, marginRight: 6 }}>✓</span>
                    Zero deprecation
                  </div>
                  <div style={{ fontSize: 12, marginBottom: 6, color: '#166534' }}>
                    <span style={{ color: '#16a34a', fontWeight: 700, marginRight: 6 }}>✓</span>
                    Engine protection
                  </div>
                  <div style={{ fontSize: 12, marginBottom: 6, color: '#166534' }}>
                    <span style={{ color: '#16a34a', fontWeight: 700, marginRight: 6 }}>✓</span>
                    Concierge services
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>

      </div>


     {/*Buttons*/}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>


        {/*Back Button*/}      
        <button onClick={handleBack} style={{
          background: '#010c3f', color: 'white', border: 'none',
          borderRadius: 10, padding: '10px 28px', fontSize: 13, cursor: 'pointer',
        }}>
          Back
        </button>
        

        {/*Next Button*/}
        <button onClick={handleNextPage} disabled={isSending} style={{
          background: isSending ? '#2cd4b8' : '#010c3f', color: 'white', border: 'none',
          borderRadius: 10, padding: '10px 28px', fontSize: 13,
          cursor: isSending ? 'not-allowed' : 'pointer',
        }}>
          {isSending ? 'Sending...' : 'Send Quote'}
        </button>

      </div>

    </div>
  )
}