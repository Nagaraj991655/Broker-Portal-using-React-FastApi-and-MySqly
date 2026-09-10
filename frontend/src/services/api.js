import axios from 'axios'

var api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

function createSubmission(data) {
  return api.post('/submissions/', data)
}

function saveVehicle(submissionId, data) {
  return api.post('/submissions/' + submissionId + '/vehicle', data)
}

function savePlan(submissionId, data) {
  return api.post('/submissions/' + submissionId + '/plan', data)
}

function getFullSubmission(submissionId) {
  return api.get('/submissions/' + submissionId + '/full')
}

function sendQuote(submissionId) {
  return api.post('/submissions/' + submissionId + '/send-quote')
}

function listSubmissions() {
  return api.get('/submissions/')
}

function getSubmission(id) {
  return api.get('/submissions/' + id)
}

export { createSubmission, saveVehicle, savePlan, getFullSubmission, sendQuote,listSubmissions, getSubmission, }
