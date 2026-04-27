// pages/quote/CustomerDetails.jsx — Step 1 of the quote flow
//
// WHAT IS THIS PAGE?
// The user fills in the customer's personal details, contact info, and address.
// When they click "Next", the data is validated, sent to the backend, and saved.
// Then the user moves to Step 2 (Vehicle Details).
//
// HOW IT WORKS:
// 1. User types into the form fields → values are stored in "form" state
// 2. User clicks "Next" → validatePage() checks all fields
// 3. If valid → createSubmission() sends data to the backend
// 4. Backend returns the submission ID → we save it in sessionStorage
// 5. Navigate to /quote/vehicle (Step 2)
//
// WHAT IS sessionStorage?
// It's like a temporary notepad in the browser.
// We save the submission ID there so Step 2 can read it.
// It gets cleared when the browser tab is closed.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StepBar from '../../components/StepBar'
import { createSubmission } from '../../services/api'
import countries from '../../data/countries.json'
import StatusBadge from '../../components/StatusBadge'

// The 5 steps shown in the progress bar at the top
var QUOTE_STEPS = [
  'Customer Details',
  'Vehicle Details',
  'Select Plan',
  'Review & Quote',
  'Payment',
]


// ── Field Component ──────────────────────────────────────────────
// A reusable wrapper that adds a label and error message around any input.
//
// WHY IS THIS DEFINED OUTSIDE THE MAIN COMPONENT?
// If we defined it inside CustomerDetails, React would destroy and
// recreate it on every render. This causes the input to lose focus
// after every keystroke (very annoying!). Defining it outside fixes this.
//
// Props:
//   label    = the text shown above the input (e.g. "First name")
//   error    = the error message to show (e.g. "First name is required")
//   children = the actual <input> or <select> element inside
function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: '0px' }}>
      <label style={{
        display: 'block',
        marginBottom: '3px',
        fontWeight: 500,
        fontSize: '12px',
        color: '#334155'
      }}>
        {label} <span style={{ color: '#ef4444' }}>*</span>
      </label>

      
      {children}

      {/* This message only shows up if there is an input error */}
      {error && (
        <span style={{ color: '#ef4444', fontSize: '10px', marginTop: '0px', display: 'block' }}>
          {error}
        </span>
      )}
    </div>
  )
}


export default function CustomerDetails() {

  // navigate lets us move the user to the next page
  const  navigate = useNavigate()

  const  [errors, setErrors] = useState({})
  const  [isSaving, setIsSaving] = useState(false)
  const  [form, setForm] = useState({
    first_name: '',
    last_name:  '',
    gender:     '',
    dob:        '',
    email:      '',
    phone:      '',
    addr1:      '',
    addr2:      '',
    city:       '',
    state:      '',
    postal:     '',
    country:    '',
  })


  
  function calculateAge(dateOfBirth) {
    let birthDate = new Date(dateOfBirth)
    let today = new Date()

    let age = today.getFullYear() - birthDate.getFullYear()
    let hasNotHadBirthdayYet =
      today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())

    if (hasNotHadBirthdayYet) {
      age = age - 1
    }
    return age
  }

  function validatePage() {
    let newErrors = {}

    
    if (!form.first_name) {
      newErrors.first_name = 'Please enter the first name'
    }
    if (!form.last_name) {
      newErrors.last_name = 'Please enter the last name'
    }
    if (!form.gender) {
      newErrors.gender = 'Please select a gender'
    }
    if (!form.dob) {
      newErrors.dob = 'Date of birth '
    } else {
      var age = calculateAge(form.dob)
      if (age < 18) {
        newErrors.dob = 'Customer must be at least 18 years old'
      }
      if (age > 79) {
        newErrors.dob = 'Customer must be below 80 years old'
      }
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!form.email) {
      newErrors.email = 'Please enter your email'
    } else if (!emailPattern.test(form.email)) {
      newErrors.email = 'Enter a valid email e.g. john@example.com'
    }
  
    const phonePattern = /^\d+$/
    if (!form.phone) {
      newErrors.phone = 'Please enter your phone number'
    } else if (!phonePattern.test(form.phone)) {
      newErrors.phone = 'Enter a valid phone number'
    }

    if (!form.addr1) {
      newErrors.addr1 = 'Please enter your address line 1'
    }
    if (!form.city) {
      newErrors.city = 'Please enter your city'
    }
    if (!form.state) {
      newErrors.state = 'Please enter your state'
    }

    const postalCodePattern = /^\d+$/
    if (!form.postal) {
      newErrors.postal = 'Please enter your postal code'
    } else if (!postalCodePattern.test(form.postal)) {
      newErrors.postal = 'Enter a valid postal code'
    }
    
    if (!form.country) {
      newErrors.country = 'Please select a country'
    }

    // Save the errors to state so they show on screen
    setErrors(newErrors)

    // Return true if there are NO errors (empty object)
    return Object.keys(newErrors).length === 0
  }


  // ── Handle Next button click ──────────────────────────────────
  // This is an "async" function because we need to wait for the backend
  // "await" pauses until the backend responds, then continues
  async function handleNextPage() {

    // Stop here if validation fails (errors will show on screen)
    const  isValid = validatePage()
    if (!isValid) return

    // Show loading state on the button
    setIsSaving(true)

    try {
      // Send the form data to the backend
      // We wrap the form in { customer: form } because the backend expects that shape
      var response = await createSubmission({ customer: form })

      // Save the submission ID and number in sessionStorage
      // Step 2 (VehicleDetails) will read these to know which submission to add to
      sessionStorage.setItem('submissionId', response.data.id)
      sessionStorage.setItem('submissionNo', response.data.submission_no)
      // Move to Next Page
      navigate('/quote/vehicle')

    } catch  {
      // If something went wrong (backend down, network error, etc.)
      alert('Error saving. Please check your connection and try again.')
    } finally {
      // Always hide the loading state when done (whether success or error)
      setIsSaving(false)
    }
  }


  // ── Helper: input style with optional red border ──────────────
  // If there's an error for this field, show a red border
  // Otherwise, show a normal gray border
  function getInputStyle(fieldName) {
    const hasError = errors[fieldName]
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


  // ── Render the page ───────────────────────────────────────────
  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>

      {/* 5-step progress bar — currently on step 0 (Customer) */}
      <StepBar steps={QUOTE_STEPS} current={0} />

      {/* Status badge showing "In Progress" */}
      <StatusBadge statusKey="InProgress" />

      {/* Two-column layout: personal details on left, address on right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>

        {/* ══════════════ LEFT COLUMN ══════════════ */}
        <div>

          {/* --- Personal Details Section --- */}
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, paddingBottom: 8 }}>
            Personal details
          </h3>

          {/* First name and Last name — side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <Field label="First name" error={errors.first_name}>
              <input
                style={getInputStyle('first_name')}
                placeholder="John"
                value={form.first_name}
                onChange={function(e) { setForm({ ...form, first_name: e.target.value }) }}
              />
            </Field>
            <Field label="Last name" error={errors.last_name}>
              <input
                style={getInputStyle('last_name')}
                placeholder="Doe"
                value={form.last_name}
                onChange={function(e) { setForm({ ...form, last_name: e.target.value }) }}
              />
            </Field>
          </div>

          {/* Gender and Date of birth — side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            <Field label="Gender" error={errors.gender}>
              <select
                style={getInputStyle('gender')}
                value={form.gender}
                onChange={function(e) { setForm({ ...form, gender: e.target.value }) }}
              >
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </Field>
            <Field label="Date of birth" error={errors.dob}>
              <input
                type="date"
                style={getInputStyle('dob')}
                value={form.dob}
                onChange={function(e) { setForm({ ...form, dob: e.target.value }) }}
              />
            </Field>
          </div>

          {/* --- Contact Information Section --- */}
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, paddingBottom: 8 }}>
            Contact information
          </h3>

          {/* Email and Phone — side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="E-mail" error={errors.email}>
              <input
                style={getInputStyle('email')}
                placeholder="john.doe@example.com"
                value={form.email}
                onChange={function(e) { setForm({ ...form, email: e.target.value }) }}
              />
            </Field>
            <Field label="Phone number" error={errors.phone}>
              <input
                style={getInputStyle('phone')}
                placeholder="0123456789"
                value={form.phone}
                onChange={function(e) {  setForm({ ...form, phone: e.target.value }) 
                }}
              />
            </Field>
          </div>

        </div>


        <div>


          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, paddingBottom: 8 }}>
            Address
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>


            <Field label="Address line 1" error={errors.addr1}>
              <input
                style={getInputStyle('addr1')}
                placeholder="1200 Example drive"
                value={form.addr1}
                onChange={function(e) { setForm({ ...form, addr1: e.target.value }) }}
              />
            </Field>

            
            <Field label="Address line 2" error={errors.addr2}>
              <input
                style={getInputStyle('addr2')}
                placeholder="Apt. 4"
                value={form.addr2}
                onChange={function(e) { setForm({ ...form, addr2: e.target.value }) }}
              />
            </Field>

          
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="City" error={errors.city}>
                <input
                  style={getInputStyle('city')}
                  placeholder="Schaumburg"
                  value={form.city}
                  onChange={function(e) { setForm({ ...form, city: e.target.value }) }}
                />
              </Field>
              <Field label="State / Province" error={errors.state}>
                <input
                  style={getInputStyle('state')}
                  placeholder="Illinois"
                  value={form.state}
                  onChange={function(e) { setForm({ ...form, state: e.target.value }) }}
                />
              </Field>
            </div>

            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Postal code" error={errors.postal}>
                <input
                  style={getInputStyle('postal')}
                  placeholder="1234"
                  value={form.postal}
                  onChange={function(e) { setForm({ ...form, postal: e.target.value }) }}
                />
              </Field>
              <Field label="Country" error={errors.country}>
                <select
                  style={getInputStyle('country')}
                  value={form.country}
                  onChange={function(e) { setForm({ ...form, country: e.target.value }) }}
                >
                  <option value="">Search</option>
                  {countries.map(function(country, index) {
                    return (
                      <option key={country.id || index} value={country.id}>
                        {country.name}
                      </option>
                    )
                  })}
                </select>
              </Field>
            </div>

          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',          
          marginTop: 24,
          paddingTop: 16,
          borderTop: '1px solid #f1f5f9',      
        }}
      >
        <button
          onClick={handleNextPage}
          disabled={isSaving}
          style={{
            background: isSaving ? '#078f07' : '#010c3f',
            color: 'white',
            border: 'none',
            borderRadius: 10,
            padding: '10px 28px',
            fontSize: 13,
            cursor: isSaving ? 'not-allowed' : 'pointer',
          }}
        >
          {isSaving ? 'Saving...' : 'Next'}
        </button>
      </div>

    </div>
  )
}
