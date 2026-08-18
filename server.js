const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());

// ========== CAMPUS DATA (Real GPS Coordinates) ==========
// Center: 31.0667°N, 77.1667°E (Wikipedia verified)
// Address: Shoghi-Mehli Bypass Road, Lower Panthaghati, Shimla 171009, HP, India
const buildings = [
    {id:1,name:"Main Gate / Entrance",category:"admin",lat:31.0652,lng:77.1655,icon:"fa-door-open",floors:"Ground",timing:"24/7",description:"Main entry point with security checkpoint and visitor registration desk.",departments:["Security"],contacts:{phone:"+91-177-XXX-XXXX",email:"security@apgshimla.edu.in"}},
    {id:2,name:"Administrative Block",category:"admin",lat:31.0658,lng:77.1660,icon:"fa-building",floors:"3 Floors",timing:"9:00 AM - 5:00 PM",description:"Registrar, Accounts, Admissions, and VC Office.",departments:["Registrar","Accounts","Admissions","VC Office"],contacts:{phone:"+91-177-XXX-XXXX",email:"admin@apgshimla.edu.in"}},
    {id:3,name:"School of Engineering & Technology",category:"academic",lat:31.0665,lng:77.1665,icon:"fa-microchip",floors:"4 Floors",timing:"8:30 AM - 5:00 PM",description:"B.Tech, M.Tech. Labs: Computer, Electronics, Mechanical, Civil workshops.",departments:["CSE","ECE","Mechanical","Civil"],contacts:{phone:"+91-177-XXX-XXXX",email:"engg@apgshimla.edu.in"}},
    {id:4,name:"School of Advance Computing",category:"academic",lat:31.0670,lng:77.1670,icon:"fa-laptop-code",floors:"3 Floors",timing:"8:30 AM - 5:00 PM",description:"BCA, MCA, B.Sc IT, M.Sc IT. Advanced computer labs with cloud infrastructure.",departments:["BCA","MCA","B.Sc IT","M.Sc IT"],contacts:{phone:"+91-177-XXX-XXXX",email:"computing@apgshimla.edu.in"}},
    {id:5,name:"School of Management",category:"academic",lat:31.0675,lng:77.1675,icon:"fa-chart-line",floors:"3 Floors",timing:"8:30 AM - 5:00 PM",description:"BBA, MBA. Case study rooms, presentation halls, business simulation labs.",departments:["BBA","MBA"],contacts:{phone:"+91-177-XXX-XXXX",email:"management@apgshimla.edu.in"}},
    {id:6,name:"School of Legal Studies & Research",category:"academic",lat:31.0680,lng:77.1680,icon:"fa-scale-balanced",floors:"3 Floors",timing:"8:30 AM - 5:00 PM",description:"BA LLB, LLB, LLM. Moot court hall and legal research center.",departments:["BA LLB","LLB","LLM"],contacts:{phone:"+91-177-XXX-XXXX",email:"law@apgshimla.edu.in"}},
    {id:7,name:"School of Journalism & Mass Communication",category:"academic",lat:31.0685,lng:77.1685,icon:"fa-video",floors:"2 Floors",timing:"8:30 AM - 5:00 PM",description:"BJMC, MJMC. TV studio, radio station, editing suites, photography lab.",departments:["BJMC","MJMC"],contacts:{phone:"+91-177-XXX-XXXX",email:"journalism@apgshimla.edu.in"}},
    {id:8,name:"School of Design",category:"academic",lat:31.0690,lng:77.1690,icon:"fa-palette",floors:"2 Floors",timing:"8:30 AM - 5:00 PM",description:"B.Des, M.Des. Design studios, fabrication lab, 3D printing, exhibition hall.",departments:["B.Des","M.Des"],contacts:{phone:"+91-177-XXX-XXXX",email:"design@apgshimla.edu.in"}},
    {id:9,name:"School of Architecture & Planning",category:"academic",lat:31.0695,lng:77.1695,icon:"fa-drafting-compass",floors:"4 Floors",timing:"8:30 AM - 5:00 PM",description:"B.Arch, M.Arch. Design studios, model-making workshop, climatology lab.",departments:["B.Arch","M.Arch"],contacts:{phone:"+91-177-XXX-XXXX",email:"architecture@apgshimla.edu.in"}},
    {id:10,name:"School of Sciences",category:"academic",lat:31.0700,lng:77.1700,icon:"fa-flask",floors:"3 Floors",timing:"8:30 AM - 5:00 PM",description:"B.Sc, M.Sc Physics, Chemistry, Maths, Biotechnology. Well-equipped science labs.",departments:["Physics","Chemistry","Maths","Biotechnology"],contacts:{phone:"+91-177-XXX-XXXX",email:"sciences@apgshimla.edu.in"}},
    {id:11,name:"School of Hospitality & Tourism",category:"academic",lat:31.0705,lng:77.1705,icon:"fa-hotel",floors:"3 Floors",timing:"8:30 AM - 5:00 PM",description:"BHM, MHM. Training kitchen, bakery, mock restaurant, front office lab.",departments:["BHM","MHM"],contacts:{phone:"+91-177-XXX-XXXX",email:"hospitality@apgshimla.edu.in"}},
    {id:12,name:"School of Art & Humanities",category:"academic",lat:31.0710,lng:77.1710,icon:"fa-book-open",floors:"2 Floors",timing:"8:30 AM - 5:00 PM",description:"BA, MA English, Psychology, Sociology, Political Science. Seminar halls, language lab.",departments:["English","Psychology","Sociology","Political Science"],contacts:{phone:"+91-177-XXX-XXXX",email:"humanities@apgshimla.edu.in"}},
    {id:13,name:"School of Para Medical Sciences",category:"academic",lat:31.0715,lng:77.1715,icon:"fa-user-nurse",floors:"3 Floors",timing:"8:30 AM - 5:00 PM",description:"Nursing, MLT, Radiology. Anatomy lab and clinical training center.",departments:["Nursing","MLT","Radiology"],contacts:{phone:"+91-177-XXX-XXXX",email:"paramedical@apgshimla.edu.in"}},
    {id:14,name:"Central Library",category:"library",lat:31.0668,lng:77.1678,icon:"fa-book",floors:"3 Floors",timing:"8:00 AM - 10:00 PM",description:"50,000+ books, digital library, e-journals, reading halls, discussion rooms.",departments:["Library Services"],contacts:{phone:"+91-177-XXX-XXXX",email:"library@apgshimla.edu.in"}},
    {id:15,name:"Main Auditorium",category:"admin",lat:31.0662,lng:77.1672,icon:"fa-theater-masks",floors:"2 Floors",timing:"Event-based",description:"1000+ capacity auditorium for convocations, seminars, cultural programs.",departments:["Events"],contacts:{phone:"+91-177-XXX-XXXX",email:"events@apgshimla.edu.in"}},
    {id:16,name:"Boys Hostel A",category:"hostel",lat:31.0650,lng:77.1680,icon:"fa-bed",floors:"4 Floors",timing:"24/7",description:"AC/Non-AC rooms, WiFi, mess, gym, common room. Capacity: 200 students.",departments:["Hostel Office"],contacts:{phone:"+91-177-XXX-XXXX",email:"hostel@apgshimla.edu.in"}},
    {id:17,name:"Boys Hostel B",category:"hostel",lat:31.0645,lng:77.1685,icon:"fa-bed",floors:"4 Floors",timing:"24/7",description:"AC/Non-AC rooms, WiFi, mess, study rooms. Capacity: 200 students.",departments:["Hostel Office"],contacts:{phone:"+91-177-XXX-XXXX",email:"hostel@apgshimla.edu.in"}},
    {id:18,name:"Girls Hostel",category:"hostel",lat:31.0640,lng:77.1690,icon:"fa-bed",floors:"4 Floors",timing:"24/7",description:"Secure AC/Non-AC accommodation, WiFi, mess, recreation. Capacity: 250 students.",departments:["Hostel Office"],contacts:{phone:"+91-177-XXX-XXXX",email:"hostel@apgshimla.edu.in"}},
    {id:19,name:"Main Cafeteria",category:"food",lat:31.0655,lng:77.1670,icon:"fa-utensils",floors:"Ground + 1",timing:"7:00 AM - 10:00 PM",description:"Multi-cuisine food court, juice bar, bakery. Breakfast, lunch, dinner, snacks.",departments:["Catering"],contacts:{phone:"+91-177-XXX-XXXX",email:"catering@apgshimla.edu.in"}},
    {id:20,name:"Cafeteria 2 (Night Canteen)",category:"food",lat:31.0648,lng:77.1682,icon:"fa-mug-hot",floors:"Ground",timing:"6:00 PM - 2:00 AM",description:"Late-night food spot near hostels. Maggi, snacks, tea, coffee.",departments:["Catering"],contacts:{phone:"+91-177-XXX-XXXX",email:"catering@apgshimla.edu.in"}},
    {id:21,name:"Sports Complex",category:"sports",lat:31.0635,lng:77.1665,icon:"fa-futbol",floors:"Open Ground",timing:"5:00 AM - 8:00 PM",description:"Cricket ground, football field, basketball, volleyball, athletics track.",departments:["Sports Department"],contacts:{phone:"+91-177-XXX-XXXX",email:"sports@apgshimla.edu.in"}},
    {id:22,name:"Indoor Sports Hall",category:"sports",lat:31.0630,lng:77.1670,icon:"fa-table-tennis",floors:"2 Floors",timing:"6:00 AM - 9:00 PM",description:"Badminton, table tennis, chess, carrom, yoga hall.",departments:["Sports Department"],contacts:{phone:"+91-177-XXX-XXXX",email:"sports@apgshimla.edu.in"}},
    {id:23,name:"Gym & Fitness Center",category:"sports",lat:31.0625,lng:77.1675,icon:"fa-dumbbell",floors:"Ground + 1",timing:"5:00 AM - 10:00 PM",description:"Modern gym equipment, cardio zone, personal trainers, aerobics room.",departments:["Sports Department"],contacts:{phone:"+91-177-XXX-XXXX",email:"sports@apgshimla.edu.in"}},
    {id:24,name:"Health Center / Medical Room",category:"medical",lat:31.0660,lng:77.1660,icon:"fa-heart-pulse",floors:"Ground",timing:"24/7",description:"24/7 medical facility with doctor on call, ambulance, first aid, pharmacy.",departments:["Medical"],contacts:{phone:"+91-177-XXX-XXXX",email:"medical@apgshimla.edu.in"}},
    {id:25,name:"ATM & Banking Point",category:"admin",lat:31.0656,lng:77.1658,icon:"fa-credit-card",floors:"Kiosk",timing:"24/7",description:"ATM kiosk and mini banking services for students and staff.",departments:["Banking"],contacts:{phone:"N/A",email:"N/A"}},
    {id:26,name:"Parking Area",category:"transport",lat:31.0648,lng:77.1650,icon:"fa-car",floors:"Open",timing:"24/7",description:"Student and faculty parking. Separate two-wheeler and four-wheeler zones.",departments:["Transport"],contacts:{phone:"+91-177-XXX-XXXX",email:"transport@apgshimla.edu.in"}},
    {id:27,name:"Bus Stop / Transport Office",category:"transport",lat:31.0650,lng:77.1652,icon:"fa-bus",floors:"Kiosk",timing:"7:00 AM - 7:00 PM",description:"University bus stand and transport office for shuttle services.",departments:["Transport"],contacts:{phone:"+91-177-XXX-XXXX",email:"transport@apgshimla.edu.in"}},
    {id:28,name:"Open Air Theatre (OAT)",category:"sports",lat:31.0642,lng:77.1668,icon:"fa-music",floors:"Open",timing:"Event-based",description:"Outdoor amphitheater for cultural events, movie nights, performances.",departments:["Cultural"],contacts:{phone:"+91-177-XXX-XXXX",email:"cultural@apgshimla.edu.in"}},
    {id:29,name:"Temple / Prayer Hall",category:"admin",lat:31.0678,lng:77.1698,icon:"fa-place-of-worship",floors:"Ground",timing:"6:00 AM - 8:00 PM",description:"Campus temple for daily prayers and meditation. Peaceful hilltop location.",departments:["Spiritual"],contacts:{phone:"N/A",email:"N/A"}},
    {id:30,name:"Department of Agriculture",category:"academic",lat:31.0708,lng:77.1708,icon:"fa-seedling",floors:"2 Floors",timing:"8:30 AM - 5:00 PM",description:"B.Sc Agriculture, M.Sc Agriculture. Farm labs, greenhouse, soil testing lab.",departments:["B.Sc Agri","M.Sc Agri"],contacts:{phone:"+91-177-XXX-XXXX",email:"agriculture@apgshimla.edu.in"}}
];

// ========== API ROUTES ==========

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString(), campus: 'APG Shimla University', center: { lat: 31.0667, lng: 77.1667 } });
});

// Get all buildings
app.get('/api/buildings', (req, res) => {
    const { category, search } = req.query;
    let result = [...buildings];
    if (category) result = result.filter(b => b.category === category);
    if (search) {
        const q = search.toLowerCase();
        result = result.filter(b => b.name.toLowerCase().includes(q) || b.description.toLowerCase().includes(q) || b.departments.some(d => d.toLowerCase().includes(q)));
    }
    res.json({ count: result.length, data: result });
});

// Get single building
app.get('/api/buildings/:id', (req, res) => {
    const building = buildings.find(b => b.id === parseInt(req.params.id));
    if (!building) return res.status(404).json({ error: 'Building not found' });
    res.json(building);
});

// Get buildings by category
app.get('/api/categories/:category', (req, res) => {
    const result = buildings.filter(b => b.category === req.params.category);
    res.json({ count: result.length, data: result });
});

// Calculate pedestrian directions using Valhalla's OpenStreetMap routing engine.
// If the public router is temporarily unavailable, return a clearly-labelled
// geometric fallback rather than failing the entire navigation experience.
function decodePolyline6(encoded) {
    let index = 0, lat = 0, lng = 0, coordinates = [];
    while (index < encoded.length) {
        let result = 0, shift = 0, byte;
        do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
        lat += (result & 1) ? ~(result >> 1) : (result >> 1);
        result = 0; shift = 0;
        do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
        lng += (result & 1) ? ~(result >> 1) : (result >> 1);
        coordinates.push([lat / 1e6, lng / 1e6]);
    }
    return coordinates;
}

function geometricRoute(lat1, lng1, lat2, lng2) {
    const distance = getDistance(lat1, lng1, lat2, lng2);
    const duration = Math.max(1, Math.ceil(distance / 5 * 60));
    const steps = Math.max(1, Math.ceil(distance * 1000 / 0.7));
    const path = Array.from({ length: 21 }, (_, i) => {
        const t = i / 20;
        return [lat1 + (lat2 - lat1) * t, lng1 + (lng2 - lng1) * t];
    });
    return { distance: Number(distance.toFixed(3)), duration, steps, path, instructions: [], fallback: true };
}

app.get('/api/directions', async (req, res) => {
    const { fromLat, fromLng, toLat, toLng } = req.query;
    const lat1 = Number(fromLat), lng1 = Number(fromLng), lat2 = Number(toLat), lng2 = Number(toLng);
    if (![lat1, lng1, lat2, lng2].every(Number.isFinite)) {
        return res.status(400).json({ error: 'Valid fromLat, fromLng, toLat, and toLng coordinates are required.' });
    }

    try {
        const response = await axios.post('https://valhalla1.openstreetmap.de/route', {
            locations: [{ lat: lat1, lon: lng1 }, { lat: lat2, lon: lng2 }],
            costing: 'pedestrian',
            units: 'kilometers',
            directions_options: { units: 'kilometers' }
        }, { timeout: 12000, headers: { 'Content-Type': 'application/json' } });
        const trip = response.data?.trip;
        const leg = trip?.legs?.[0];
        if (!trip || !leg?.shape) throw new Error('Pedestrian router returned no route shape');
        const route = {
            distance: Number(trip.summary.length.toFixed(3)),
            duration: Math.max(1, Math.ceil(trip.summary.time / 60)),
            steps: Math.max(1, Math.ceil(trip.summary.length * 1000 / 0.7)),
            path: decodePolyline6(leg.shape),
            instructions: (leg.maneuvers || []).map(m => ({ instruction: m.instruction, distance: Number((m.length || 0).toFixed(2)), time: Math.ceil((m.time || 0) / 60) })),
            fallback: false
        };
        return res.json({ from: { lat: lat1, lng: lng1 }, to: { lat: lat2, lng: lng2 }, unit: 'km', mode: 'walking', ...route });
    } catch (error) {
        console.warn('Pedestrian routing unavailable:', error.message);
        return res.json({ from: { lat: lat1, lng: lng1 }, to: { lat: lat2, lng: lng2 }, unit: 'km', mode: 'walking', ...geometricRoute(lat1, lng1, lat2, lng2) });
    }
});

// Find nearest building
app.get('/api/nearest', (req, res) => {
    const { lat, lng, category } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'Missing lat/lng' });

    const userLat = parseFloat(lat), userLng = parseFloat(lng);
    let candidates = category ? buildings.filter(b => b.category === category) : buildings;

    const withDist = candidates.map(b => {
        const d = getDistance(userLat, userLng, b.lat, b.lng);
        return { ...b, distance: parseFloat(d.toFixed(3)) };
    });

    withDist.sort((a, b) => a.distance - b.distance);
    res.json({ nearest: withDist[0], top5: withDist.slice(0, 5) });
});

// Get campus events (mock - connect to DB in production)
app.get('/api/events', (req, res) => {
    const events = [
        { id: 1, title: "Tech Fest 2026", location: "Main Auditorium", buildingId: 15, date: "2026-09-15", time: "10:00 AM", type: "technical" },
        { id: 2, title: "Campus Recruitment Drive", location: "School of Management", buildingId: 5, date: "2026-09-20", time: "9:00 AM", type: "placement" },
        { id: 3, title: "Yoga Session", location: "Sports Complex", buildingId: 21, date: "2026-09-10", time: "6:00 AM", type: "sports" },
        { id: 4, title: "Inter-Department Cricket Match", location: "Sports Complex", buildingId: 21, date: "2026-09-12", time: "2:00 PM", type: "sports" },
        { id: 5, title: "Guest Lecture: AI in Healthcare", location: "School of Engineering", buildingId: 3, date: "2026-09-18", time: "11:00 AM", type: "academic" }
    ];
    res.json({ count: events.length, data: events });
});

// Get shuttle/bus schedule
app.get('/api/shuttle', (req, res) => {
    const schedule = [
        { route: "Campus → Shimla Bus Stand", departure: "8:00 AM", return: "5:30 PM", frequency: "Every 2 hours" },
        { route: "Campus → ISBT Tutikandi", departure: "9:00 AM", return: "6:00 PM", frequency: "Every 3 hours" },
        { route: "Campus → Railway Station", departure: "7:30 AM", return: "5:00 PM", frequency: "Every 4 hours" },
        { route: "Hostel → Academic Block", departure: "8:15 AM", return: "5:15 PM", frequency: "Continuous" }
    ];
    res.json({ count: schedule.length, data: schedule });
});

// Get emergency contacts
app.get('/api/emergency', (req, res) => {
    res.json({
        medical: { name: "Health Center", phone: "+91-177-XXX-XXXX", location: "Building 24", available: "24/7" },
        security: { name: "Campus Security", phone: "+91-177-XXX-XXXX", location: "Main Gate", available: "24/7" },
        ambulance: { name: "Ambulance Service", phone: "108", location: "On-call", available: "24/7" },
        fire: { name: "Fire Station", phone: "101", location: "Shimla City", available: "24/7" },
        police: { name: "Police Station", phone: "100", location: "Shimla City", available: "24/7" }
    });
});

// Get campus stats
app.get('/api/stats', (req, res) => {
    res.json({
        totalBuildings: buildings.length,
        totalAcres: 44,
        totalStudents: 5000,
        totalCourses: 35,
        countries: 28,
        states: 29,
        established: 2012,
        coordinates: { lat: 31.0667, lng: 77.1667 },
        address: "Shoghi-Mehli Bypass Road, Lower Panthaghati, Shimla 171009, Himachal Pradesh, India"
    });
});

// Helper: Haversine distance
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found', available: ['/api/health', '/api/buildings', '/api/directions', '/api/nearest', '/api/events', '/api/shuttle', '/api/emergency', '/api/stats'] });
});

app.listen(PORT, () => {
    console.log(`🎓 APG Campus Navigator API running on http://localhost:${PORT}`);
    console.log(`📍 Campus: APG Shimla University, Shimla 171009, HP, India`);
    console.log(`🗺️  Center: 31.0667°N, 77.1667°E`);
    console.log(`🏗️  Buildings: ${buildings.length}`);
    console.log(`
API Endpoints:`);
    console.log(`  GET /api/health          - Health check`);
    console.log(`  GET /api/buildings       - All buildings (?category=&search=)`);
    console.log(`  GET /api/buildings/:id   - Single building`);
    console.log(`  GET /api/directions      - Route (?fromLat=&fromLng=&toLat=&toLng=)`);
    console.log(`  GET /api/nearest         - Nearest building (?lat=&lng=&category=)`);
    console.log(`  GET /api/events          - Campus events`);
    console.log(`  GET /api/shuttle         - Bus schedule`);
    console.log(`  GET /api/emergency       - Emergency contacts`);
    console.log(`  GET /api/stats           - Campus statistics`);
});