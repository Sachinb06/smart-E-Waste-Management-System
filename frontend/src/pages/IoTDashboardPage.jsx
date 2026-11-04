import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Cpu, 
  Wifi, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Sliders, 
  Code2, 
  Layers, 
  Radio,
  Flame,
  BatteryCharging,
  Smartphone,
  Laptop
} from 'lucide-react';
import { api } from '../services/api';

export default function IoTDashboardPage() {
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulatingBin, setSimulatingBin] = useState(null);
  const [newSimFill, setNewSimFill] = useState(50);
  const [showHardwareGuide, setShowHardwareGuide] = useState(false);
  const [telemetryLog, setTelemetryLog] = useState([]);

  const loadBins = async () => {
    try {
      const data = await api.getIoTBins();
      setBins(data);
    } catch (err) {
      console.error("Failed to load bins", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBins();
    const interval = setInterval(loadBins, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateSubmit = async (binCode) => {
    try {
      const updated = await api.simulateIoTBin(binCode, parseFloat(newSimFill));
      setBins(prev => prev.map(b => b.bin_code === binCode ? updated : b));
      setSimulatingBin(null);
      setTelemetryLog(prev => [
        `[${new Date().toLocaleTimeString()}] Simulated reading on ${binCode} -> Fill: ${newSimFill}%`,
        ...prev.slice(0, 7)
      ]);
    } catch (err) {
      alert("Simulation failed: " + err.message);
    }
  };

  // Trigger test hardware ping
  const handleSimulateHardwareTelemetry = async (binCode) => {
    const randomDistance = Math.floor(Math.random() * 85) + 5; // 5cm to 90cm
    try {
      const res = await api.sendIoTTelemetry({
        bin_code: binCode,
        distance_cm: randomDistance,
        total_depth_cm: 100.0,
        device_id: 'ESP32-HC-SR04-01',
        raw_payload: `ping_distance=${randomDistance}cm`
      });
      loadBins();
      setTelemetryLog(prev => [
        `[${new Date().toLocaleTimeString()}] HARDWARE PACKET: Bin ${binCode} received sensor echo: ${randomDistance}cm (Calculated Fill: ${res.fill_percentage}%) [is_simulated = false]`,
        ...prev.slice(0, 7)
      ]);
    } catch (err) {
      alert("Hardware ping failed: " + err.message);
    }
  };

  const getStatusBadge = (status, fill) => {
    if (fill >= 90 || status === 'Full') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wide bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> Full (Requires Pickup)
        </span>
      );
    }
    if (fill >= 75 || status === 'Warning') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wide bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Warning (75%+)
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Operational
      </span>
    );
  };

  const getBinIcon = (category) => {
    if (category.includes('Mobile')) return Smartphone;
    if (category.includes('Computer')) return Laptop;
    if (category.includes('Battery')) return BatteryCharging;
    return Cpu;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Ultrasonic Sensor Telemetry</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Smart IoT E-Waste Monitoring Dashboard
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Real-time ultrasonic bin fill monitoring inspired by the physical smart e-waste container prototype. Automatically dispatches collection trucks when bins exceed 75% capacity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHardwareGuide(!showHardwareGuide)}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Code2 className="w-4 h-4 text-emerald-600" />
            {showHardwareGuide ? 'Hide ESP32 Guide' : 'ESP32 / Arduino Integration'}
          </button>
          <button
            onClick={loadBins}
            className="p-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 shadow-xs"
            title="Refresh Bin Levels"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ESP32 / Arduino Hardware Integration Modal / Drawer */}
      {showHardwareGuide && (
        <div className="bg-slate-950 text-slate-200 rounded-3xl p-6 sm:p-8 space-y-5 border border-slate-800 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <Cpu className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-extrabold text-white">
                Physical Hardware Integration (ESP32 + HC-SR04 Ultrasonic Sensor)
              </h3>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800">
              API: POST /api/iot/telemetry
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
            Your physical smart container prototype connects an ultrasonic distance sensor under the lid pointing down into the bin. It computes the air distance in centimeters and periodically sends telemetry via Wi-Fi HTTP POST to your FastAPI backend:
          </p>

          <pre className="p-4 rounded-2xl bg-black/70 text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
{`// Sample ESP32 Arduino C++ Code
#include <WiFi.h>
#include <HTTPClient.h>

const int TRIG_PIN = 5;
const int ECHO_PIN = 18;
const char* serverUrl = "http://YOUR_SERVER_IP:8000/api/iot/telemetry";

void sendBinTelemetry() {
  digitalWrite(TRIG_PIN, LOW); delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long duration = pulseIn(ECHO_PIN, HIGH);
  float distanceCm = duration * 0.034 / 2;

  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  String payload = "{\\"bin_code\\":\\"BIN-MOBILE-01\\",\\"distance_cm\\":" + String(distanceCm) + ",\\"total_depth_cm\\":100.0}";
  int httpCode = http.POST(payload);
  http.end();
}`}
          </pre>
        </div>
      )}

      {/* 4 IoT Smart Bins Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 font-bold text-sm">
          Connecting to IoT sensor mesh...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {bins.map((bin) => {
            const Icon = getBinIcon(bin.category);
            const fill = bin.current_fill_percentage;
            const isHazardBin = bin.category === 'Batteries';

            return (
              <div
                key={bin.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between space-y-6 hover:border-emerald-300 transition-all"
              >
                {/* Top Section */}
                <div className="space-y-4">
                  
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-400 block font-bold">
                        {bin.bin_code}
                      </span>
                      {bin.is_simulated ? (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          Simulated Sensor
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                          <Wifi className="w-3 h-3" /> Live Hardware
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                      {bin.bin_name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{bin.location}</p>
                  </div>

                  {/* Status Badge */}
                  <div>{getStatusBadge(bin.status, fill)}</div>

                  {/* Fill Level Metric Gauge */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-bold text-slate-500">Fill Level:</span>
                      <span className="text-3xl font-black text-slate-900 tracking-tight">
                        {fill.toFixed(0)}%
                      </span>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="w-full h-3.5 bg-slate-100 rounded-full p-0.5 border border-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          fill >= 90 
                            ? 'bg-gradient-to-r from-red-500 to-rose-600'
                            : fill >= 75
                            ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                            : 'bg-gradient-to-r from-emerald-500 to-green-600'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(3, fill))}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                      <span>Max Capacity: {bin.max_capacity_liters} L</span>
                      <span>Est. Remaining: {(bin.max_capacity_liters * (1 - fill / 100)).toFixed(0)} L</span>
                    </div>
                  </div>

                  {/* Battery Hazard Notice */}
                  {isHazardBin && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Thermal sensor active. Automated halon fire suppression armed.</span>
                    </div>
                  )}

                </div>

                {/* Bottom Controls */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Last Echo:</span>
                    <span>{new Date(bin.last_updated).toLocaleTimeString()}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => handleSimulateHardwareTelemetry(bin.bin_code)}
                      className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors flex items-center justify-center gap-1"
                      title="Simulates genuine microcontroller ultrasonic packet"
                    >
                      <Wifi className="w-3.5 h-3.5 text-emerald-600" /> Ping Sensor
                    </button>

                    <button
                      onClick={() => {
                        setSimulatingBin(bin.bin_code);
                        setNewSimFill(bin.current_fill_percentage);
                      }}
                      className="px-2.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold transition-colors flex items-center justify-center gap-1 border border-emerald-200"
                    >
                      <Sliders className="w-3.5 h-3.5" /> Adjust Level
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Adjust Level Modal */}
      {simulatingBin && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-5 shadow-2xl">
            <h3 className="text-base font-extrabold text-slate-900">
              Adjust Bin Fill Level: <span className="text-emerald-700 font-mono">{simulatingBin}</span>
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-slate-600">Fill Percentage:</span>
                <span className="text-2xl font-black text-emerald-700">{newSimFill}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={newSimFill}
                onChange={e => setNewSimFill(e.target.value)}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">
                Note: This simulation updates the database status and is explicitly labeled as simulated.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSimulatingBin(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSimulateSubmit(simulatingBin)}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm"
              >
                Save Fill Level
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Telemetry Log Feed */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-600" /> Live Ultrasonic Sensor Telemetry Log
        </h3>
        {telemetryLog.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No telemetry pings received yet in this session. Click "Ping Sensor" on any bin above to test hardware packet ingestion.</p>
        ) : (
          <div className="space-y-1 font-mono text-[11px] text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            {telemetryLog.map((log, i) => (
              <div key={i} className="text-emerald-800">{log}</div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
