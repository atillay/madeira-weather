/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';
import { Town, HourlyForecast } from '../types';
import { TOWNS, getHourlyForecast } from '../services/ipmaService';
import { WeatherIcon } from './WeatherIcon';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { parseISO } from 'date-fns';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Fix for default Leaflet marker icons which are often broken due to Vite asset bundling
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface MadeiraMapProps {
  onTownSelect: (town: Town) => void;
  selectedTownId: number | null;
  userLocation?: { lat: number, lng: number } | null;
  centerOnUserTrigger?: number;
  hourOffset?: number;
}

const UserLocationIcon = L.divIcon({
  html: `<div class="relative flex items-center justify-center w-6 h-6">
           <div class="absolute w-full h-full bg-blue-500 rounded-full animate-ping opacity-75"></div>
           <div class="relative w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-md"></div>
         </div>`,
  className: 'bg-transparent border-none',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Internal component to programmatically pan/zoom when a town is selected elsewhere
const MapController = ({ selectedTown, userLocation, centerOnUserTrigger }: { 
  selectedTown: Town | null, 
  userLocation?: { lat: number, lng: number } | null,
  centerOnUserTrigger?: number 
}) => {
  const map = useMap();
  
  // Center on town when selectedTown changes
  useEffect(() => {
    if (selectedTown) {
      map.panTo([selectedTown.lat, selectedTown.lng], { animate: true });
    }
  }, [selectedTown, map]);

  // Center on user when centerOnUserTrigger changes
  useEffect(() => {
    if (centerOnUserTrigger && userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 13, { animate: true });
    }
  }, [centerOnUserTrigger, userLocation, map]);

  return null;
};

// Custom Weather Marker Icon Generator
const createWeatherIcon = (weatherId: number | null, temp: number | null, isSelected: boolean, isNight: boolean) => {
  if (weatherId === null) {
    return isSelected
      ? L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [30, 46],
          iconAnchor: [15, 46],
          className: 'selected-marker-glow'
        })
      : DefaultIcon;
  }

  const svgHtml = renderToString(<WeatherIcon typeId={weatherId} isNight={isNight} />);
  
  return L.divIcon({
    html: `
      <div className="relative group cursor-pointer transform transition-transform ${isSelected ? 'scale-125 z-50' : 'scale-100 hover:scale-110'}">
        <div class="relative flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg border-2 ${isSelected ? 'border-blue-500' : 'border-slate-200'}">
          <div class="w-8 h-8">${svgHtml}</div>
          
          ${temp !== null ? `
            <div class="absolute -top-1 -right-4 bg-white border border-slate-200 px-1.5 py-0.5 rounded-full shadow-sm z-10">
              <span class="text-[9px] font-bold text-slate-800">${Math.round(temp)}°</span>
            </div>
          ` : ''}
        </div>
        ${isSelected ? '<div class="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 rotate-45 border-r border-b border-blue-500"></div>' : ''}
      </div>
    `,
    className: 'bg-transparent border-none', // Override default leaflet background
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24],
  });
};

export const MadeiraMap: React.FC<MadeiraMapProps> = ({ 
  onTownSelect, 
  selectedTownId, 
  userLocation, 
  centerOnUserTrigger, 
  hourOffset = 0 
}) => {
  const selectedTown = TOWNS.find(t => t.id === selectedTownId) || null;
  const [allForecasts, setAllForecasts] = useState<Record<number, HourlyForecast[]>>({});

  useEffect(() => {
    let active = true;

    async function loadAllForecastData() {
      try {
        const results = await Promise.all(
          TOWNS.map(async (t) => {
            const data = await getHourlyForecast(t.id);
            return { id: t.id, forecasts: data };
          })
        );
        
        if (!active) return;
        
        const forecastMap: Record<number, HourlyForecast[]> = {};
        results.forEach(r => {
          forecastMap[r.id] = r.forecasts;
        });
        
        setAllForecasts(forecastMap);
      } catch (err) {
        console.warn("Failed to load map forecast details", err);
      }
    }
    
    loadAllForecastData();
    
    return () => { active = false; };
  }, []);

  return (
    <div className="w-full h-full bg-slate-100 relative z-0 overflow-hidden">
      <MapContainer 
        center={[32.75, -16.95]} 
        zoom={10} 
        minZoom={10}
        maxZoom={13}
        maxBounds={[
          [31.85, -17.85], // South West
          [33.65, -16.05]  // North East
        ]}
        maxBoundsViscosity={1.0}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {TOWNS.map((town) => {
          const isSelected = selectedTownId === town.id;
          const forecasts = allForecasts[town.id] || [];
          
          let currentForecast: HourlyForecast | null = null;
          
          if (forecasts.length > 0) {
            const currentTime = new Date().getTime();
            const targetTime = currentTime + (hourOffset * 60 * 60 * 1000);
            const gracePeriod = 30 * 60 * 1000;
            
            currentForecast = forecasts.find(f => {
              if (!f.time) return false;
              const fTime = parseISO(f.time).getTime();
              return fTime >= targetTime - gracePeriod;
            }) || forecasts[0];
          }

          const weatherId = currentForecast?.weatherType ?? null;
          const temp = currentForecast?.temp ?? null;
          
          const forecastHour = currentForecast?.time 
            ? parseISO(currentForecast.time).getHours() 
            : new Date().getHours();
          const isNight = forecastHour >= 20 || forecastHour < 7;
          
          return (
            <Marker 
              key={town.id} 
              position={[town.lat, town.lng]}
              icon={createWeatherIcon(weatherId, temp, isSelected, isNight)}
              eventHandlers={{
                click: () => onTownSelect(town),
              }}
              zIndexOffset={isSelected ? 1000 : 0}
            />
          );
        })}

        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={UserLocationIcon}
            zIndexOffset={2000}
          />
        )}

        <MapController 
          selectedTown={selectedTown} 
          userLocation={userLocation}
          centerOnUserTrigger={centerOnUserTrigger}
        />
      </MapContainer>
    </div>
  );
};
