/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, parseISO } from 'date-fns';
import { motion } from 'motion/react';
import { HourlyForecast, Town } from '../types';
import { TOWNS } from '../services/ipmaService';
import { WeatherIcon } from './WeatherIcon';
import { Droplets, Thermometer, Clock, ChevronDown } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ForecastDetailsProps {
  town: Town;
  forecasts: HourlyForecast[];
  isLoading: boolean;
  selectedHourOffset?: number;
  maxHours?: number;
  onTownSelect?: (town: Town) => void;
}

export const ForecastDetails: React.FC<ForecastDetailsProps> = ({ town, forecasts, isLoading, selectedHourOffset = 0, maxHours = 48, onTownSelect }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // We removed the auto-scroll behavior to prevent unwanted vertical page jumping
    // while the user is interacting with the map slider.
    // The highlight (selectedHourOffset === idx) remains to provide visual feedback.
  }, [selectedHourOffset, isLoading]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-6 p-8">
        <motion.div
           animate={{ rotate: 360 }}
           transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
           className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full"
        />
        <p className="text-slate-400 font-medium animate-pulse">Loading forecast...</p>
      </div>
    );
  }

  if (forecasts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 inline-block max-w-sm">
          <Droplets className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-900 font-bold mb-2">Hourly Data Unavailable</p>
          <p className="text-slate-500 text-sm leading-relaxed">
            The hourly telemetry for {town.name} is currently not being broadcast by the IPMA terminal. 
            Hourly data is usually refreshed every 6-12 hours.
          </p>
        </div>
      </div>
    );
  }

  const currentHourTime = new Date().getTime();

  // Filter forecasts to only include those at or after the current hour (giving a small grace period to not drop the current active hour)
  // IPMA dates are in Portuguese standard time, but JS parseISO creates local time which normally handles it.
  // We'll subtract 1 hour to make sure we show the current running hour block
  const cutoffTime = currentHourTime - (60 * 60 * 1000); 

  const futureForecasts = forecasts.filter(f => {
    if (!f.time) return false;
    const fTime = parseISO(f.time).getTime();
    return fTime >= cutoffTime;
  });

  const chartData = futureForecasts.slice(0, maxHours + 1).map(f => {
    const parsedDate = parseISO(f.time || new Date().toISOString());
    const hourStr = format(parsedDate, 'HH:mm');
    const hourNum = parseInt(hourStr.split(':')[0], 10);
    const isNight = hourNum >= 20 || hourNum < 7;
    
    return {
      time: hourStr,
      date: format(parsedDate, 'dd/MM'),
      temp: f.temp || 0,
      rain: f.rainProb || 0,
      weatherType: f.weatherType || 1,
      isNight
    };
  });

  return (
    <div className="flex flex-col flex-1 animate-in fade-in slide-in-from-bottom-2 duration-500 bg-white">
      {/* Current Selection Header */}
      <div className="p-6 lg:p-8 pb-4 bg-white">
        <div className="flex justify-between items-start">
          <div className="w-full relative">
            <select
              value={town.id}
              onChange={(e) => {
                const townId = Number(e.target.value);
                const t = TOWNS.find(t => t.id === townId);
                if (t && onTownSelect) onTownSelect(t);
              }}
              className="w-full appearance-none bg-transparent text-3xl font-bold text-slate-900 tracking-tight pr-10 focus:outline-none cursor-pointer"
            >
              {TOWNS.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 flex items-center pr-2 text-slate-400">
              <ChevronDown className="w-6 h-6" />
            </div>
            <p className="text-slate-500 text-sm font-medium mt-1">Madeira Archipelago</p>
          </div>
        </div>
      </div>

      {/* Hourly List */}
      <div className="bg-slate-50 p-6 lg:p-8 mt-auto border-t border-slate-100">
        <div className="flex items-center gap-4 mb-6">
           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Next {maxHours} Hours</h3>
           <div className="flex-1 h-px bg-slate-200" />
        </div>

        <div 
          ref={scrollRef}
          className="flex overflow-x-auto gap-3 pb-4 custom-scrollbar snap-x scroll-smooth"
        >
          {chartData.map((hour, idx) => (
            <div
              key={idx}
              className={cn(
                "flex flex-col items-center justify-between min-w-[90px] p-4 rounded-2xl border transition-all hover:shadow-md snap-start",
                selectedHourOffset === idx 
                  ? "bg-blue-50 border-blue-400 shadow-md ring-2 ring-blue-100" 
                  : "bg-white border-slate-200 shadow-sm hover:border-blue-300"
              )}
            >
              <div className="flex flex-col items-center mb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{hour.date}</span>
                <span className="font-mono text-sm font-bold text-slate-700 leading-none">{hour.time}</span>
              </div>
              
              <WeatherIcon typeId={hour.weatherType} isNight={hour.isNight} className="w-10 h-10 mb-3" />
              
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg font-bold text-slate-800 leading-none">{hour.temp}<span className="text-xs font-normal ml-[1px] text-slate-400">°</span></span>
                
                {hour.rain > 0 ? (
                  <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-blue-500">
                    <Droplets className="w-3 h-3" />
                    <span>{hour.rain}%</span>
                  </div>
                ) : (
                  <div className="h-4 mt-1"></div> /* Spacer to maintain alignment when no rain */
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

