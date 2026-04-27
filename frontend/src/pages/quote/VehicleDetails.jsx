import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveVehicle } from '../../services/api'
import StepBar from '../../components/StepBar'
import StatusBadge from '../../components/StatusBadge'
import vehiclesData from '../../data/vehicles.json'

var QUOTE_STEPS = [
  'Customer Details',
  'Vehicle Details',
  'Select Plan',
  'Review & Quote',
  'Payment',
]

function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{
        display: 'block',
        marginBottom: '4px',
        fontWeight: 500,
        fontSize: '13px',
        color: '#334155'
      }}>
        {label} <span style={{ color: '#ef4444' }}>*</span>
      </label>
      {children}
      {error && (
        <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '2px', display: 'block' }}>
          {error}
        </span>
      )}
    </div>
  )
}


export default function VehicleDetails() {

  const navigate = useNavigate()
  const submissionId = sessionStorage.getItem('submissionId')


  
  const [form, setForm] = useState({
    make:                 '',
    model:                '',
    year:                 '',
    mileage:              '',
    estimatedMarketValue: '',
  })

  const [errors, setErrors]     = useState({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(function() {
    if (!submissionId) {
      navigate('/quote/customer')
    }
  }, [submissionId, navigate])


  //  Validation 
  function validatePage() {
    const newErrors = {}

    if (!form.make)  { newErrors.make  = 'Make is required'  }
    if (!form.model) { newErrors.model = 'Model is required' }
    if (!form.year)  { newErrors.year  = 'Year is required'  }

    if (!form.mileage) {
      newErrors.mileage = 'Mileage is required'
    } else if (parseFloat(form.mileage) < 0) {
      newErrors.mileage = 'Mileage must be a positive number'
    }

    if (!form.estimatedMarketValue) {
      newErrors.estimatedMarketValue = 'Estimated market value is required'
    } else if (parseFloat(form.estimatedMarketValue) <= 0) {
      newErrors.estimatedMarketValue = 'Market value must be greater than 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }


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


  // ── Handle Back ─────────────────────────────────────────────
  function handleBack() {
    navigate('/quote/customer')
  }


  // ── Handle Next ─────────────────────────────────────────────
  async function handleNextPage() {
    var isValid = validatePage()
    if (!isValid) return

    setIsSaving(true)

    try {
      await saveVehicle(submissionId, {
        make:                 form.make,
        model:                form.model,
        year:                 parseInt(form.year, 10),
        mileage:              parseFloat(form.mileage),
        estimatedMarketValue: parseFloat(form.estimatedMarketValue),
      })

      navigate('/quote/plan')

    } catch {
      alert('Error saving vehicle details. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }


  // Render 
  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>

      <StepBar steps={QUOTE_STEPS} current={1} />
      <StatusBadge statusKey="InProgress" />

      <h3 style={{ fontSize: 15, fontWeight: 600, margin: '24px 0 16px' }}>
        Vehicle details
      </h3>


    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>

    
      <Field label="Make" error={errors.make}>
        <select
          style={getInputStyle('make')}
          value={form.make}
          onChange={function(e) { setForm({ ...form, make: e.target.value }) }}
        >
          <option value="">Select</option>
          {vehiclesData.map(function(make,index){
            return(
              <option key={vehiclesData.id || index} value={vehiclesData.make}>
                {make.make}
              </option>
            )
          })}
        </select>
      </Field>

      {/* Model dropdown — all models from vehicles.json */}
      <Field label="Model" error={errors.model}>
        <select
          style={getInputStyle('model')}
          value={form.model}
          onChange={function(e) { setForm({ ...form, model: e.target.value }) }}
        >
          <option value="">Select</option>
          {vehiclesData.map(function(model,index){
            return(
              <option key={vehiclesData.id || index} value={vehiclesData.model}>
                {model.model}
              </option>
            )
          })}
        </select>
      </Field>

      {/* Year dropdown — all years from vehicles.json */}
      <Field label="Year" error={errors.year}>
        <select
          style={getInputStyle('year')}
          value={form.year}
          onChange={function(e) { setForm({ ...form, year: e.target.value }) }}
        >
          <option value="">Select</option>
          {vehiclesData.map(function(year,index){
            return(
              <option key={vehiclesData.id || index} value={vehiclesData.year}>
                {year.year}
              </option>
            )
          })}
        </select>
      </Field>
          </div>
      {/* Mileage and Estimated Market Value side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        <Field label="Mileage (km)" error={errors.mileage}>
          <input
            type="number"
            style={getInputStyle('mileage')}
            placeholder="--please select--"
            min="0"
            value={form.mileage}
            onChange={function(e) { setForm({ ...form, mileage: e.target.value }) }}
          />
        </Field>

        <Field label="Estimated Market Value ($)" error={errors.estimatedMarketValue}>
          <input
            type="number"
            style={getInputStyle('estimatedMarketValue')}
            placeholder="e.g. 15000"
            min="0"
            value={form.estimatedMarketValue}
            onChange={function(e) { setForm({ ...form, estimatedMarketValue: e.target.value }) }}
          />
        </Field>

      </div>

      {/* Footer buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
        <button onClick={handleBack} style={{
          background: '#010c3f', color: 'white', border: 'none',
          borderRadius: 10, padding: '10px 28px', fontSize: 13, cursor: 'pointer',
        }}>
         Back
        </button>
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