const BASE_URL = '/api';

export function getProfile() {
  try {
    const raw = localStorage.getItem('farmerProfile');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading from localStorage', e);
  }
  return {
    name: "Ramesh Patil",
    village: "Wadgaon",
    district: "Pune",
    state: "Maharashtra",
    crop: "Tomato",
    stage: "Vegetative",
    soilType: "Black",
    landSize: "3",
    irrigationType: "Drip"
  };
}

export const apiClient = {
  // Farmers
  getFarmers: () => fetch(`${BASE_URL}/farmers`).then((res) => res.json()),
  getFarmerById: (id) => fetch(`${BASE_URL}/farmers/${id}`).then((res) => res.json()),
  createFarmer: (data) => fetch(`${BASE_URL}/farmers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then((res) => res.json()),
  updateFarmer: (id, data) => fetch(`${BASE_URL}/farmers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then((res) => res.json()),

  // Crops
  getCropsByFarmerId: (farmerId) => fetch(`${BASE_URL}/crops/${farmerId}`).then((res) => res.json()),
  createCrop: (data) => fetch(`${BASE_URL}/crops`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then((res) => res.json()),

  // Advisories
  getAdvisoriesByFarmerId: (farmerId) => fetch(`${BASE_URL}/advisories/${farmerId}`).then((res) => res.json()),
  createAdvisory: (data) => fetch(`${BASE_URL}/advisories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then((res) => res.json()),

  // Pest Detections
  getPestDetectionsByFarmerId: (farmerId) => fetch(`${BASE_URL}/pest-detections/${farmerId}`).then((res) => res.json()),
  createPestDetection: (data) => fetch(`${BASE_URL}/pest-detections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then((res) => res.json()),

  // Irrigation Logs
  getIrrigationLogsByFarmerId: (farmerId) => fetch(`${BASE_URL}/irrigation-logs/${farmerId}`).then((res) => res.json()),
  createIrrigationLog: (data) => fetch(`${BASE_URL}/irrigation-logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then((res) => res.json()),

  // Cost Records
  getCostRecordsByFarmerId: (farmerId) => fetch(`${BASE_URL}/cost-records/${farmerId}`).then((res) => res.json()),
  createCostRecord: (data) => fetch(`${BASE_URL}/cost-records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then((res) => res.json()),
};
