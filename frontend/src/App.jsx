import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler 
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { 
  Bell, Search, User, LayoutDashboard, Activity, Settings, AlertTriangle, ShieldCheck, Cpu, Map as MapIcon, Box, Radio, PlaySquare, Flame 
} from 'lucide-react';
import BuildingMap from './BuildingMap';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// -------------------------------------------------------------------------
// 2D CAD BLUEPRINT COMPONENT (Dynamic A* Routing Engine)
// -------------------------------------------------------------------------
const FloorPlan2D = ({ fireActive, fireLocation }) => {
  
  const scenarioConfig = {
    floor_1: {
      fire: { cx: 225, cy: 150, text: "🔥 HAZARD (FLAT 101)" },
      route: "M 875 475 L 800 500 L 700 500 L 620 450 L 550 450 L 550 520 L 500 520", 
      arrow: "485,510 515,510 500,530" 
    },
    floor_2: {
      fire: { cx: 800, cy: 150, text: "🔥 HAZARD (FLAT 102)" },
      route: "M 125 125 L 200 150 L 300 150 L 380 250 L 450 250 L 450 450 L 500 450 L 500 520", 
      arrow: "485,510 515,510 500,530" 
    },
    floor_3: {
      fire: { cx: 225, cy: 500, text: "🔥 HAZARD (FLAT 103)" },
      route: "M 875 125 L 800 150 L 700 150 L 620 250 L 550 250 L 550 150 L 500 150", 
      arrow: "485,160 515,160 500,140" 
    },
    floor_4: {
      fire: { cx: 800, cy: 500, text: "🔥 HAZARD (FLAT 104)" },
      route: "M 125 125 L 200 150 L 300 150 L 380 250 L 450 250 L 450 150 L 500 150", 
      arrow: "485,160 515,160 500,140" 
    }
  };

  const currentScenario = fireLocation && scenarioConfig[fireLocation] ? scenarioConfig[fireLocation] : scenarioConfig['floor_2'];

  return (
    <div className="w-full h-full bg-[#040814] flex items-center justify-center p-6 relative overflow-hidden">
      <style>
        {`
          @keyframes dash-flow { to { stroke-dashoffset: -30; } }
          .animate-path { animation: dash-flow 1s linear infinite; }
          @keyframes pulse-danger { 0%, 100% { opacity: 0.3; transform: scale(0.95); } 50% { opacity: 0.6; transform: scale(1.05); } }
          .animate-danger { 
            animation: pulse-danger 2s ease-in-out infinite; 
            transform-origin: center; 
            transform-box: fill-box; 
          }
          .blueprint-text { font-family: monospace; letter-spacing: 2px; }
        `}
      </style>
      <svg viewBox="0 0 1000 700" className="w-full h-full max-h-full drop-shadow-2xl">
        <rect width="1000" height="700" fill="#020617" rx="12" />
        <pattern id="grid-small" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#1e293b" strokeWidth="0.5" opacity="0.5"/>
        </pattern>
        <pattern id="grid-large" width="50" height="50" patternUnits="userSpaceOnUse">
          <rect width="50" height="50" fill="url(#grid-small)"/>
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#334155" strokeWidth="1" opacity="0.6"/>
        </pattern>
        <rect width="1000" height="700" fill="url(#grid-large)" rx="12" />

        <g stroke="#475569" strokeWidth="1" className="blueprint-text" fontSize="12" fill="#475569">
          <line x1="50" y1="20" x2="950" y2="20" />
          <line x1="50" y1="15" x2="50" y2="25" />
          <line x1="950" y1="15" x2="950" y2="25" />
          <text x="500" y="15" textAnchor="middle">OVERALL STRUCTURAL LENGTH: 45.0m</text>
        </g>

        <g stroke="#60a5fa" strokeWidth="6" fill="#0f172a" strokeLinecap="square" opacity="0.8">
          <rect x="50" y="50" width="900" height="600" rx="2" />
          <line x1="50" y1="300" x2="400" y2="300" />
          <line x1="600" y1="300" x2="950" y2="300" />
          <line x1="50" y1="400" x2="400" y2="400" />
          <line x1="600" y1="400" x2="950" y2="400" />
          <line x1="400" y1="50" x2="400" y2="300" />
          <line x1="600" y1="50" x2="600" y2="300" />
          <line x1="400" y1="400" x2="400" y2="650" />
          <line x1="600" y1="400" x2="600" y2="650" />
        </g>

        <g stroke="#38bdf8" strokeWidth="2" opacity="0.5">
          <line x1="200" y1="50" x2="200" y2="200" /> 
          <line x1="50" y1="200" x2="200" y2="200" /> 
          <line x1="800" y1="50" x2="800" y2="200" />
          <line x1="800" y1="200" x2="950" y2="200" />
          <line x1="200" y1="400" x2="200" y2="550" />
          <line x1="50" y1="550" x2="200" y2="550" />
          <line x1="800" y1="400" x2="800" y2="550" />
          <line x1="800" y1="550" x2="950" y2="550" />
        </g>

        <g stroke="#2dd4bf" strokeWidth="2" fill="none">
          <path d="M 400 250 A 40 40 0 0 1 360 210" strokeDasharray="3 3"/>
          <line x1="400" y1="250" x2="360" y2="250" strokeWidth="3" />
          <path d="M 600 250 A 40 40 0 0 0 640 210" strokeDasharray="3 3"/>
          <line x1="600" y1="250" x2="640" y2="250" strokeWidth="3" />
          <path d="M 400 450 A 40 40 0 0 0 360 490" strokeDasharray="3 3"/>
          <line x1="400" y1="450" x2="360" y2="450" strokeWidth="3" />
          <path d="M 600 450 A 40 40 0 0 1 640 490" strokeDasharray="3 3"/>
          <line x1="600" y1="450" x2="640" y2="450" strokeWidth="3" />
          <path d="M 200 150 A 30 30 0 0 0 170 180" strokeDasharray="3 3"/>
          <line x1="200" y1="150" x2="170" y2="150" strokeWidth="2" stroke="#38bdf8" />
        </g>

        <g>
          <rect x="400" y="50" width="200" height="150" fill="#0f172a" stroke="#60a5fa" strokeWidth="4" />
          <path d="M 400 70 L 600 70 M 400 90 L 600 90 M 400 110 L 600 110 M 400 130 L 600 130 M 400 150 L 600 150 M 400 170 L 600 170 M 400 190 L 600 190" stroke="#38bdf8" strokeWidth="1" opacity="0.6"/>
          <line x1="500" y1="70" x2="500" y2="180" stroke="#38bdf8" strokeWidth="2" />
          <polygon points="495,70 505,70 500,60" fill="#38bdf8" /> 
          <text x="500" y="190" fill="#bae6fd" fontSize="14" className="blueprint-text" textAnchor="middle" fontWeight="bold">MAIN STAIRWELL</text>

          <rect x="400" y="500" width="200" height="150" fill="#0f172a" stroke="#fbbf24" strokeWidth="4" />
          <path d="M 400 520 L 600 520 M 400 540 L 600 540 M 400 560 L 600 560 M 400 580 L 600 580 M 400 600 L 600 600 M 400 620 L 600 620 M 400 640 L 600 640" stroke="#fbbf24" strokeWidth="1" opacity="0.6"/>
          <line x1="500" y1="520" x2="500" y2="630" stroke="#fbbf24" strokeWidth="2" />
          <polygon points="495,630 505,630 500,640" fill="#fbbf24" /> 
          <text x="500" y="515" fill="#fcd34d" fontSize="14" className="blueprint-text" textAnchor="middle" fontWeight="bold">EMERGENCY EXIT</text>

          <rect x="420" y="300" width="160" height="100" stroke="#60a5fa" strokeWidth="4" fill="#0f172a" />
          <rect x="425" y="305" width="70" height="90" stroke="#38bdf8" strokeWidth="2" fill="none" />
          <line x1="425" y1="305" x2="495" y2="395" stroke="#38bdf8" strokeWidth="1" opacity="0.5" />
          <line x1="495" y1="305" x2="425" y2="395" stroke="#38bdf8" strokeWidth="1" opacity="0.5" />
          <rect x="505" y="305" width="70" height="90" stroke="#38bdf8" strokeWidth="2" fill="none" />
          <line x1="505" y1="305" x2="575" y2="395" stroke="#38bdf8" strokeWidth="1" opacity="0.5" />
          <line x1="575" y1="305" x2="505" y2="395" stroke="#38bdf8" strokeWidth="1" opacity="0.5" />
          <text x="500" y="355" fill="#bae6fd" fontSize="16" className="blueprint-text drop-shadow-md" textAnchor="middle" fontWeight="bold">LIFTS</text>
        </g>

        <g fill="#94a3b8" fontSize="14" className="blueprint-text" textAnchor="middle">
          <text x="70" y="80" textAnchor="start" fill="#60a5fa" fontWeight="bold" fontSize="18">FLAT 101</text>
          <text x="300" y="150">LIVING AREA</text>
          <text x="125" y="125">BEDROOM</text>
          <text x="125" y="250">BATH</text>
          <text x="930" y="80" textAnchor="end" fill="#60a5fa" fontWeight="bold" fontSize="18">FLAT 102</text>
          <text x="700" y="150">LIVING AREA</text>
          <text x="875" y="125">BEDROOM</text>
          <text x="70" y="430" textAnchor="start" fill="#60a5fa" fontWeight="bold" fontSize="18">FLAT 103</text>
          <text x="300" y="500">LIVING AREA</text>
          <text x="125" y="475">BEDROOM</text>
          <text x="930" y="430" textAnchor="end" fill="#60a5fa" fontWeight="bold" fontSize="18">FLAT 104</text>
          <text x="700" y="500">LIVING AREA</text>
        </g>

        <g>
          <circle cx="200" cy="150" r="6" fill="#2563eb" />
          <circle cx="800" cy="150" r="6" fill="#2563eb" />
          <circle cx="200" cy="500" r="6" fill="#2563eb" />
          <circle cx="800" cy="500" r="6" fill="#2563eb" />
          <circle cx="500" cy="250" r="6" fill="#2563eb" /> 
        </g>

        {/* DYNAMIC SIMULATION LAYER */}
        {fireActive && (
          <g>
            <circle cx={currentScenario.fire.cx} cy={currentScenario.fire.cy} r="140" fill="#ef4444" className="animate-danger" />
            <circle cx={currentScenario.fire.cx} cy={currentScenario.fire.cy} r="50" fill="#ef4444" opacity="0.8" />
            <text x={currentScenario.fire.cx} y={currentScenario.fire.cy + 5} fill="#ffffff" fontSize="18" textAnchor="middle" fontWeight="bold">
              {currentScenario.fire.text}
            </text>

            <path d={currentScenario.route} fill="none" stroke="#16a34a" strokeWidth="12" strokeLinejoin="round" strokeLinecap="round" opacity="0.4" />
            <path d={currentScenario.route} fill="none" stroke="#4ade80" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="15 15" className="animate-path" />
            <polygon points={currentScenario.arrow} fill="#4ade80" />
            
            <rect x="420" y="300" width="160" height="100" fill="#ef4444" opacity="0.2" />
            <line x1="420" y1="300" x2="580" y2="400" stroke="#ef4444" strokeWidth="6" opacity="0.9" />
            <line x1="580" y1="300" x2="420" y2="400" stroke="#ef4444" strokeWidth="6" opacity="0.9" />
            <text x="500" y="380" fill="#ef4444" fontSize="14" fontWeight="bold" textAnchor="middle" className="drop-shadow-md">LOCKED</text>
          </g>
        )}
      </svg>
    </div>
  );
};


// -------------------------------------------------------------------------
// MAIN DASHBOARD APPLICATION
// -------------------------------------------------------------------------
function App() {
  const [appMode, setAppMode] = useState('LIVE'); 
  const [simState, setSimState] = useState({ active: false, floor: null, temp: 24, smoke: 300 });

  const [backendStatus, setBackendStatus] = useState("Connecting...");
  const [fireActive, setFireActive] = useState(false);
  const [fireLocation, setFireLocation] = useState(null);
  const [evacuationRoutes, setEvacuationRoutes] = useState({}); 
  const [mapView, setMapView] = useState('2D'); 

  const [timeLabels, setTimeLabels] = useState([]);
  const [temperatureData, setTemperatureData] = useState([]);
  const [smokeData, setSmokeData] = useState([]);

  // ==========================================
  // 1. DYNAMIC HINDI VOICE ANNOUNCEMENT
  // ==========================================
  useEffect(() => {
    if (fireActive && fireLocation) {
      const flatMap = { 'floor_1': 'फ्लैट 101', 'floor_2': 'फ्लैट 102', 'floor_3': 'फ्लैट 103', 'floor_4': 'फ्लैट 104' };
      const activeFlat = flatMap[fireLocation] || 'इमारत';
      
      const hindiMessage = `आपातकालीन सूचना। ${activeFlat} में आग लगने की पुष्टि हुई है। कृपया स्क्रीन पर दिख रहे हरे सुरक्षित रास्तों का पालन करते हुए तुरंत बाहर निकलें। लिफ्ट का उपयोग न करें।`;
      
      const announcement = new SpeechSynthesisUtterance(hindiMessage);
      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find(v => v.lang === 'hi-IN' || v.lang.includes('hi'));
      
      if (hindiVoice) announcement.voice = hindiVoice;
      
      announcement.lang = 'hi-IN'; 
      announcement.rate = 0.85; 
      announcement.pitch = 1.1;
      
      window.speechSynthesis.speak(announcement);
    } else {
      window.speechSynthesis.cancel(); 
    }
  }, [fireActive, fireLocation]);

  // ==========================================
  // 2. DIGITAL TWIN SIMULATION ENGINE
  // ==========================================
  useEffect(() => {
    if (appMode !== 'SIMULATION') return;

    const simInterval = setInterval(() => {
      setSimState(prev => {
        let newTemp = prev.temp;
        let newSmoke = prev.smoke;

        if (prev.active) {
          // Fire mode: Temp ramps up to 80C, Smoke ramps up to 2500 (matching ESP32 analog scale)
          newTemp = Math.min(newTemp + (Math.random() * 8 + 3), 85); 
          newSmoke = Math.min(newSmoke + (Math.random() * 200 + 100), 2500); 
        } else {
          // Normal mode: Tiny fluctuations around 24C and 300 raw analog smoke
          newTemp = 24 + (Math.random() * 1 - 0.5);
          newSmoke = 300 + (Math.random() * 20 - 10);
        }

        fetch('http://127.0.0.1:5000/api/sensor/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            temperature: newTemp,
            smoke_level: newSmoke,
            floor_id: prev.floor || 'floor_2'
          })
        }).catch(() => console.log("Simulated ESP32 post failed"));

        return { ...prev, temp: newTemp, smoke: newSmoke };
      });
    }, 2000);

    return () => clearInterval(simInterval);
  }, [appMode]);

  // ==========================================
  // 3. CORE TELEMETRY POLLING
  // ==========================================
  useEffect(() => {
    const fetchSystemStatus = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/status');
        const data = await response.json();
        setBackendStatus(data.status === "online" ? "Online" : "Offline");
        setFireActive(data.fire_active);
        setFireLocation(data.fire_location);

        if (data.sensors) {
          const currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
          setTimeLabels(prev => [...prev.slice(-9), currentTime]);
          setTemperatureData(prev => [...prev.slice(-9), data.sensors.temperature]);
          setSmokeData(prev => [...prev.slice(-9), data.sensors.smoke_level]);
        }
      } catch (error) {
        setBackendStatus("Disconnected");
      }
    };
    fetchSystemStatus();
    const intervalId = setInterval(fetchSystemStatus, 2000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchRoutes = async () => {
      if (fireActive) {
        try {
          const floors = ['floor_1', 'floor_2', 'floor_3', 'floor_4'];
          const routesObj = {};
          for (const floor of floors) {
            const res = await fetch(`http://127.0.0.1:5000/api/evacuation/${floor}`);
            const data = await res.json();
            routesObj[floor] = data.instruction;
          }
          setEvacuationRoutes(routesObj);
        } catch (err) {}
      } else {
        setEvacuationRoutes({});
      }
    };
    fetchRoutes();
  }, [fireActive]);

  // --- SIMULATION CONTROLS ---
  const triggerSimulation = (floor) => {
    setSimState(prev => ({ ...prev, active: true, floor: floor }));
  };

  const resetSystem = async () => {
    setSimState({ active: false, floor: null, temp: 24, smoke: 300 });
    try {
      await fetch('http://127.0.0.1:5000/api/system/reset', { method: 'POST' });
    } catch (error) { console.error("Error resetting system:", error); }
  };

  const darkChartOptions = {
    responsive: true, maintainAspectRatio: false,
    elements: { point: { radius: 0 }, line: { tension: 0.4, borderWidth: 2 } },
    scales: { 
      x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } },
      y: { grid: { color: '#1e293b' }, ticks: { color: '#64748b', font: { size: 10 } }, beginAtZero: false } 
    },
    plugins: { legend: { display: false } }
  };

  return (
    <div className="flex h-screen bg-[#0b1121] text-slate-300 font-sans overflow-hidden selection:bg-cyan-900">
      
      {/* SIDEBAR */}
      <div className="w-16 flex flex-col items-center py-6 bg-[#0f172a] border-r border-slate-800/50 z-20 shadow-2xl relative">
        <div className="text-cyan-400 mb-8"><ShieldCheck size={28} /></div>
        
        <div className="flex flex-col gap-6 w-full items-center">
          <div 
            onClick={() => { setAppMode('LIVE'); setSimState({ active: false, floor: null, temp: 24, smoke: 300 }); }}
            className={`p-3 rounded-xl cursor-pointer transition-all ${appMode === 'LIVE' ? 'bg-cyan-500/10 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'text-slate-500 hover:text-slate-300'}`}
            title="Live Hardware Mode"
          >
            <Radio size={20} />
          </div>
          
          <div 
            onClick={() => setAppMode('SIMULATION')}
            className={`p-3 rounded-xl cursor-pointer transition-all ${appMode === 'SIMULATION' ? 'bg-purple-500/10 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]' : 'text-slate-500 hover:text-slate-300'}`}
            title="Simulation Demo Mode"
          >
            <PlaySquare size={20} />
          </div>
        </div>

        <div className="mt-auto p-3 text-slate-500 hover:text-slate-300 cursor-pointer transition-colors"><Settings size={20} /></div>
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        <header className="h-16 flex items-center justify-between px-8 bg-[#0b1121] border-b border-slate-800/50">
          <h1 className="text-xl font-bold text-slate-100 tracking-wide">
            Command <span className={appMode === 'LIVE' ? "text-cyan-500" : "text-purple-500"}>Dashboard</span>
          </h1>
          
          <div className="flex items-center gap-6">
            <div className={`px-4 py-1.5 rounded-full border text-xs font-bold tracking-wider ${
              appMode === 'LIVE' ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400' : 'bg-purple-500/10 border-purple-500/50 text-purple-400 animate-pulse'
            }`}>
              {appMode === 'LIVE' ? '● LIVE HARDWARE FEED' : '▶ SIMULATION OVERRIDE ACTIVE'}
            </div>
            <div className="flex items-center gap-3 border-l border-slate-800 pl-6 cursor-pointer">
              <div className="bg-slate-800 p-1.5 rounded-full"><User size={18} className="text-slate-300" /></div>
              <div className="text-sm font-medium">Vedant Harne</div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-y-auto">
          
          <div className="col-span-12 xl:col-span-3 flex flex-col gap-6">
            <div className="bg-[#0f172a] rounded-2xl p-5 border border-slate-800 shadow-xl">
              <h3 className="text-sm font-medium text-slate-400 mb-4">Live Hardware Sensor</h3>
              <div className="flex justify-around items-center">
                
                {/* Temperature Exact Value */}
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 flex items-center justify-center relative shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                    <span className="text-2xl font-bold text-white">
                      {Number(temperatureData[temperatureData.length-1] || 0).toFixed(1)}
                    </span>
                    <span className="text-[10px] text-slate-500 absolute bottom-3">°C</span>
                  </div>
                  <span className="text-xs text-green-400 mt-3 font-medium">
                    {appMode === 'SIMULATION' && simState.active ? <span className="text-orange-400">Heating...</span> : 'Sensor Active'}
                  </span>
                </div>

                {/* Smoke RAW Analog Value */}
                <div className="flex flex-col items-center">
                  <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center relative ${fireActive ? 'border-red-500/20 border-t-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-blue-500/20 border-t-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]'}`}>
                    <span className="text-2xl font-bold text-white">
                      {Math.round(smokeData[smokeData.length-1] || 0)}
                    </span>
                    <span className="text-[10px] text-slate-500 absolute bottom-3">RAW</span>
                  </div>
                  <span className={`text-xs mt-3 font-medium ${fireActive ? 'text-red-400' : 'text-slate-400'}`}>Gas/Smoke Level</span>
                </div>

              </div>
            </div>

            <div className="bg-[#0f172a] rounded-2xl p-5 border border-slate-800 shadow-xl h-60 flex-1">
               <h3 className="text-sm font-medium text-slate-400 mb-2">Historical Telemetry</h3>
               <div className="h-44">
                 <Line data={{ labels: timeLabels, datasets: [{ data: temperatureData, borderColor: appMode === 'LIVE' ? '#0ea5e9' : '#a855f7', backgroundColor: appMode === 'LIVE' ? 'rgba(14, 165, 233, 0.1)' : 'rgba(168, 85, 247, 0.1)', fill: true }] }} options={darkChartOptions} />
               </div>
            </div>
          </div>

          <div className="col-span-12 xl:col-span-6 flex flex-col gap-6">
            <div className="bg-[#0f172a] rounded-2xl border border-slate-800 shadow-xl flex-1 flex flex-col overflow-hidden relative">
              
              <div className="p-4 border-b border-slate-800/80 flex justify-between items-center bg-[#0f172a] z-10">
                 <h2 className="text-sm font-bold text-slate-200 tracking-wider">BUILDING FLOOR PLAN</h2>
                 
                 <div className="flex bg-[#020617] rounded-lg p-1 border border-slate-800">
                   <button 
                     onClick={() => setMapView('3D')} 
                     className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-md transition-all ${mapView === '3D' ? (appMode === 'LIVE' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-purple-500/20 text-purple-400') : 'text-slate-500 hover:text-slate-300'}`}
                   >
                     <Box size={14} /> 3D ISOMETRIC
                   </button>
                   <button 
                     onClick={() => setMapView('2D')} 
                     className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-md transition-all ${mapView === '2D' ? (appMode === 'LIVE' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-purple-500/20 text-purple-400') : 'text-slate-500 hover:text-slate-300'}`}
                   >
                     <MapIcon size={14} /> 2D TACTICAL
                   </button>
                 </div>
              </div>

              <div className="flex-1 bg-[#020617] relative">
                {mapView === '3D' ? (
                  <BuildingMap fireActive={fireActive} fireLocation={fireLocation} evacuationRoutes={evacuationRoutes} />
                ) : (
                  <FloorPlan2D fireActive={fireActive} fireLocation={fireLocation} />
                )}
              </div>
            </div>
            
            <div className="bg-[#0f172a] rounded-2xl p-5 border border-slate-800 shadow-xl h-48">
              <h3 className="text-sm font-medium text-slate-400 mb-2">Algorithm Processing Stream</h3>
               <div className="h-32">
                 <Line data={{ labels: timeLabels, datasets: [{ data: temperatureData.map(d=>d*2), borderColor: '#8b5cf6', tension: 0.5 }, { data: smokeData, borderColor: '#10b981', tension: 0.5 }] }} options={darkChartOptions} />
               </div>
            </div>
          </div>

          <div className="col-span-12 xl:col-span-3 flex flex-col gap-6">
            
            {appMode === 'SIMULATION' && (
              <div className="bg-[#1e1b4b]/50 rounded-2xl p-5 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                <div className="flex items-center gap-2 mb-4">
                  <Flame className="text-purple-400" size={18} />
                  <h3 className="text-sm font-bold text-purple-400">Simulation Override Center</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button onClick={() => triggerSimulation('floor_1')} className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 rounded border border-slate-700 transition-colors">Ignite Flat 101</button>
                  <button onClick={() => triggerSimulation('floor_2')} className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 rounded border border-slate-700 transition-colors">Ignite Flat 102</button>
                  <button onClick={() => triggerSimulation('floor_3')} className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 rounded border border-slate-700 transition-colors">Ignite Flat 103</button>
                  <button onClick={() => triggerSimulation('floor_4')} className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 rounded border border-slate-700 transition-colors">Ignite Flat 104</button>
                </div>
                <button onClick={resetSystem} className="w-full bg-slate-800 hover:bg-green-900/40 hover:text-green-400 text-slate-300 text-sm font-bold py-2.5 rounded border border-slate-700 hover:border-green-500/50 transition-all">
                  Reset Environment
                </button>
                <p className="text-[10px] text-slate-500 mt-3 italic">*Note: Graphs will organically ramp up to simulate raw hardware analog thresholds.</p>
              </div>
            )}

            <div className="bg-[#0f172a] rounded-2xl p-5 border border-slate-800 shadow-xl flex-1">
              <h3 className="text-sm font-medium text-slate-400 mb-4">Alert Notification</h3>
              <div className="space-y-4">
                {fireActive ? (
                  <>
                    <div className="bg-red-950/40 border border-red-900/50 p-4 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.15)] relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                      <div className="flex gap-3">
                        <AlertTriangle className="text-red-500" size={20} />
                        <div>
                          <h4 className="text-sm font-bold text-red-400">Emergency Alert</h4>
                          <p className="text-xs text-red-300/70 mt-1 leading-tight">Fire emergency detected on {fireLocation?.replace('_', ' ')}.</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-[#1e293b]/30 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
                     <ShieldCheck className="text-slate-500" size={20} />
                     <div>
                       <h4 className="text-sm font-medium text-slate-300">High Status</h4>
                       <p className="text-xs text-slate-500 mt-0.5">Emergency protocol is on standby.</p>
                     </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#0f172a] rounded-2xl p-5 border border-slate-800 shadow-xl h-60">
              <h3 className="text-sm font-medium text-slate-400 mb-2">Incident Event Log</h3>
               <div className="h-44">
                 <Line data={{ labels: timeLabels, datasets: [{ data: smokeData.map(d=>d*1.5), borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.4 }] }} options={{...darkChartOptions, scales: { x: {display: false}, y: {display: false}}}} />
               </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

export default App;