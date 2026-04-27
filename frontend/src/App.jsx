// App.jsx — The root of the entire application
//
// WHAT IS THIS FILE?
// This is the "skeleton" of the app. It sets up:
// 1. Page routing — which page shows for which URL
// 2. The main layout — sidebar on the left, page content on the right
//
// HOW ROUTING WORKS:
// We use react-router-dom to handle navigation.
// <BrowserRouter> enables URL-based navigation.
// <Routes> contains all the URL-to-page mappings.
// <Route path="/quote/customer" element={<CustomerDetails />} />
//   → means "when the URL is /quote/customer, show the CustomerDetails page"
//
// LAYOUT:
// The page is split into two sections using display: 'flex':
//   [  Sidebar  |  Page Content (changes based on URL)  ]

import { BrowserRouter, Routes, Route } from 'react-router-dom'


import Sidebar         from './components/Sidebar'
import Dashboard       from './pages/Dashboard'
import CustomerDetails from './pages/quote/CustomerDetails'
import VehicleDetails  from './pages/quote/VehicleDetails'
import PlanDetails from './pages/quote/PlanDeatils'
import ReviewAndQuote from './pages/quote/ReviewAndQuote'
import Success from './pages/quote/Success'


export default function App() {
  return (
    // BrowserRouter enables navigation between pages without full page reloads
    <BrowserRouter>

      {/* Main layout: sidebar on the left, page content on the right */}
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>

        {/* Left sidebar — always visible on every page */}
        <Sidebar />

        {/* Right content area — changes based on the current URL */}
        <div style={{ flex: 1, padding: 32, overflowY: 'auto' }}>

          <Routes>
            {/* Home page → show the Dashboard (submissions table) */}
            <Route path="/" element={<Dashboard />} />

            {/* Step 1 of the quote flow → Customer Details form */}
            <Route path="/quote/customer" element={<CustomerDetails />} />

            {/* Step 2 of the quote flow → Vehicle Details form */}
            <Route path="/quote/vehicle" element={<VehicleDetails />} />


            <Route path="/quote/plan" element={<PlanDetails />} />

            <Route path="/quote/review" element={<ReviewAndQuote />} />

            <Route path="/quote/success" element={<Success />} />

          </Routes>

        </div>
      </div>

    </BrowserRouter>
  )
}
