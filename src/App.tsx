/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { Cloud, Map as MapIcon, Info, Github, ExternalLink, ChevronDown, Navigation, Clock } from 'lucide-react';
import { MadeiraMap } from './components/MadeiraMap';
import { ForecastDetails } from './components/ForecastDetails';
import { TOWNS, getHourlyForecast } from './services/ipmaService';
import { Town, HourlyForecast } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Haversine formula to find distance between two lat/lng pairs in kilometers
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}

export default function App() {
  const [selectedTown, setSelectedTown] = useState<Town>(TOWNS.find(t => t.name === 'Funchal') || TOWNS[0]);
  const [forecasts, setForecasts] = useState<HourlyForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [centerOnUserTrigger, setCenterOnUserTrigger] = useState(0);
  const [hourOffset, setHourOffset] = useState(0);
  const [maxTimelineHours, setMaxTimelineHours] = useState<number>(24);

  const locateClosestTown = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLoc = { lat: latitude, lng: longitude };
        setUserLocation(newLoc);
        setCenterOnUserTrigger(prev => prev + 1);
        
        let closest = TOWNS[0];
        let minDistance = Infinity;

        TOWNS.forEach(town => {
          const dist = getDistance(latitude, longitude, town.lat, town.lng);
          if (dist < minDistance) {
            minDistance = dist;
            closest = town;
          }
        });

        setSelectedTown(closest);
        setIsLocating(false);
      },
      (error) => {
        console.warn("Geolocation skipped or failed:", error);
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await getHourlyForecast(selectedTown.id);
        setForecasts(data);
      } catch (err) {
        console.error('Failed to fetch forecast:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedTown]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-blue-100">
      {/* Top Header */}
      <header className="bg-blue-600 border-b border-blue-700 shrink-0 z-50">
        <div className="w-full px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold tracking-tight text-white leading-tight">Madeira weather</h1>
              <span className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold leading-tight">
                Data from <a href="https://api.ipma.pt/" target="_blank" rel="noopener noreferrer" className="hover:text-white underline decoration-blue-400/50 underline-offset-2">IPMA</a>
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row items-stretch w-full">
          {/* Map Section - Left side on desktop */}
          <div className="w-full lg:w-1/2 h-[50vh] lg:h-auto lg:min-h-[calc(100vh-64px)] relative z-0 border-b lg:border-b-0 lg:border-r border-slate-200">
            <MadeiraMap 
              onTownSelect={setSelectedTown} 
              selectedTownId={selectedTown.id} 
              userLocation={userLocation}
              centerOnUserTrigger={centerOnUserTrigger}
              hourOffset={hourOffset}
            />
            <div className="absolute top-4 right-4 z-[400] lg:z-[1000]">
              <button
                onClick={locateClosestTown}
                disabled={isLocating}
                title="Find closest town"
                className={cn(
                  "p-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-lg flex items-center justify-center disabled:opacity-50",
                  isLocating && "animate-pulse"
                )}
              >
                <Navigation className={cn("w-5 h-5", isLocating && "text-blue-500")} />
              </button>
            </div>
          </div>
          
          {/* Right side content: Timeline & Forecast Details */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <div className="flex flex-col flex-1 bg-white">
                {/* Timeline Slider */}
                <div className="bg-white border-b border-slate-200 p-6 lg:p-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold font-mono whitespace-nowrap">
                        {format(new Date(new Date().getTime() + hourOffset * 60 * 60 * 1000), 'eee d LLL, HH:00')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex bg-slate-100 p-1 rounded-xl">
                        {[24, 48, 72].map(hours => (
                          <button
                            key={hours}
                            onClick={() => {
                              setMaxTimelineHours(hours);
                              if (hourOffset > hours) setHourOffset(hours);
                            }}
                            className={cn(
                              "px-3 py-1 text-xs font-bold rounded-lg transition-colors",
                              maxTimelineHours === hours 
                                ? "bg-white text-blue-600 shadow-sm" 
                                : "text-slate-500 hover:text-slate-700"
                            )}
                          >
                            {hours}h
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative h-14 flex items-center group">
                    <style>
                      {`
                        .custom-slider::-webkit-slider-thumb {
                          appearance: none;
                          width: 32px;
                          height: 32px;
                          background-color: white;
                          border-radius: 50%;
                          box-shadow: 0 0 10px rgba(0,0,0,0.2);
                          border: 4px solid #2563eb;
                          cursor: grab;
                          transition: transform 0.1s;
                          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%232563eb" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="8 16 4 12 8 8"/><polyline points="16 8 20 12 16 16"/></svg>');
                          background-position: center;
                          background-repeat: no-repeat;
                        }
                        .custom-slider:active::-webkit-slider-thumb {
                          cursor: grabbing;
                          transform: scale(1.1);
                        }
                        .custom-slider::-moz-range-thumb {
                          width: 24px;
                          height: 24px;
                          background-color: white;
                          border-radius: 50%;
                          box-shadow: 0 0 10px rgba(0,0,0,0.2);
                          border: 4px solid #2563eb;
                          cursor: grab;
                          transition: transform 0.1s;
                          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%232563eb" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="8 16 4 12 8 8"/><polyline points="16 8 20 12 16 16"/></svg>');
                          background-position: center;
                          background-repeat: no-repeat;
                        }
                        .custom-slider:active::-moz-range-thumb {
                          cursor: grabbing;
                          transform: scale(1.1);
                        }
                      `}
                    </style>
                    <input 
                      type="range" 
                      min="0" 
                      max={maxTimelineHours} 
                      step="1" 
                      value={hourOffset}
                      onChange={(e) => setHourOffset(parseInt(e.target.value))}
                      className="custom-slider w-full h-3 bg-slate-200 rounded-lg appearance-none focus:outline-none shadow-inner"
                      style={{
                        background: `linear-gradient(to right, #2563eb ${(hourOffset / maxTimelineHours) * 100}%, #e2e8f0 ${(hourOffset / maxTimelineHours) * 100}%)`
                      }}
                    />
                    
                    <div className="absolute top-10 left-0 w-full flex justify-between px-1 pointer-events-none">
                      {Array.from({ length: (maxTimelineHours / (maxTimelineHours === 24 ? 6 : maxTimelineHours === 48 ? 12 : 24)) + 1 }, (_, i) => i * (maxTimelineHours === 24 ? 6 : maxTimelineHours === 48 ? 12 : 24)).map((mark) => (
                        <span key={mark} className="text-[10px] font-bold text-slate-300">
                          {mark === 0 ? 'Now' : `+${mark}h`}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Forecast Details */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedTown.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col flex-1 h-full w-full"
                  >
                    <ForecastDetails 
                      town={selectedTown} 
                      forecasts={forecasts} 
                      isLoading={loading} 
                      selectedHourOffset={hourOffset}
                      maxHours={maxTimelineHours}
                      onTownSelect={setSelectedTown}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
      </main>
    </div>
  );
}


