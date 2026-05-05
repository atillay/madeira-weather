/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface WeatherIconProps {
  typeId: number;
  isNight?: boolean;
  className?: string;
}

const Moon = () => (
   <svg viewBox="0 0 32 32" className="w-full h-full drop-shadow-md">
     <path d="M20.5 23.5A8.5 8.5 0 1 1 15 6A10 10 0 0 0 20.5 23.5Z" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1" strokeLinejoin="round" />
   </svg>
);

const MoonCloud = () => (
   <svg viewBox="0 0 32 32" className="w-full h-full drop-shadow-md">
     <path d="M22 17A6.5 6.5 0 1 1 17 4A7.5 7.5 0 0 0 22 17Z" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1" strokeLinejoin="round" />
     <g fill="#F3F4F6" filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.1))">
       <rect x="4" y="16" width="22" height="10" rx="5" />
       <circle cx="11" cy="16" r="6" />
       <circle cx="18" cy="17" r="4.5" />
     </g>
   </svg>
);

const Sun = () => (
  <svg viewBox="0 0 32 32" className="w-full h-full drop-shadow-md">
    <circle cx="16" cy="16" r="7.5" fill="#FBBF24" />
    <g stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round">
      <line x1="16" y1="3" x2="16" y2="5" />
      <line x1="16" y1="27" x2="16" y2="29" />
      <line x1="3" y1="16" x2="5" y2="16" />
      <line x1="27" y1="16" x2="29" y2="16" />
      <line x1="6.5" y1="6.5" x2="8.5" y2="8.5" />
      <line x1="23.5" y1="23.5" x2="25.5" y2="25.5" />
      <line x1="6.5" y1="25.5" x2="8.5" y2="23.5" />
      <line x1="23.5" y1="6.5" x2="25.5" y2="8.5" />
    </g>
  </svg>
);

const SunCloud = () => (
  <svg viewBox="0 0 32 32" className="w-full h-full drop-shadow-md">
    <circle cx="21" cy="11" r="5" fill="#FBBF24" />
    <g stroke="#F59E0B" strokeWidth="2" strokeLinecap="round">
      <line x1="21" y1="3" x2="21" y2="4" />
      <line x1="29" y1="11" x2="30" y2="11" />
      <line x1="26.5" y1="5.5" x2="27.5" y2="6.5" />
    </g>
    <g fill="#F3F4F6" filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.1))">
      <rect x="4" y="16" width="22" height="10" rx="5" />
      <circle cx="11" cy="16" r="6" />
      <circle cx="18" cy="17" r="4.5" />
    </g>
  </svg>
);

const Cloud = () => (
  <svg viewBox="0 0 32 32" className="w-full h-full drop-shadow-md">
    <g fill="#E5E7EB" filter="drop-shadow(0px 3px 3px rgba(0,0,0,0.15))">
      <rect x="5" y="14" width="22" height="11" rx="5.5" />
      <circle cx="12" cy="14" r="6.5" />
      <circle cx="20" cy="15" r="5" />
    </g>
  </svg>
);

const Rain = ({ heavy = false, isNight = false }: { heavy?: boolean; isNight?: boolean }) => (
  <svg viewBox="0 0 32 32" className="w-full h-full drop-shadow-md">
    {isNight && (
      <path d="M22 17A6.5 6.5 0 1 1 17 4A7.5 7.5 0 0 0 22 17Z" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1" strokeLinejoin="round" />
    )}
    <g fill={isNight ? "#6B7280" : "#9CA3AF"} filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.15))">
      <rect x="5" y="12" width="22" height="10" rx="5" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="20" cy="13" r="4.5" />
    </g>
    <g stroke={isNight ? "#60A5FA" : "#3B82F6"} strokeWidth="2.5" strokeLinecap="round">
      <line x1="10" y1="24" x2="8" y2="28" />
      <line x1="16" y1="24" x2="14" y2="28" />
      <line x1="22" y1="24" x2="20" y2="28" />
      {heavy && (
        <>
          <line x1="13" y1="26" x2="11" y2="30" />
          <line x1="19" y1="26" x2="17" y2="30" />
        </>
      )}
    </g>
  </svg>
);

const Thunderstorm = ({ isNight = false }: { isNight?: boolean }) => (
  <svg viewBox="0 0 32 32" className="w-full h-full drop-shadow-md">
    {isNight && (
      <path d="M22 17A6.5 6.5 0 1 1 17 4A7.5 7.5 0 0 0 22 17Z" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1" strokeLinejoin="round" />
    )}
    <g fill={isNight ? "#4B5563" : "#6B7280"} filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.2))">
      <rect x="5" y="10" width="22" height="10" rx="5" />
      <circle cx="12" cy="10" r="6" />
      <circle cx="20" cy="11" r="4.5" />
    </g>
    <path d="M17 21 L13 26 L16 26 L14 31 L19 25 L16 25 Z" fill="#FBBF24" />
  </svg>
);

const Snow = ({ isNight = false }: { isNight?: boolean }) => (
  <svg viewBox="0 0 32 32" className="w-full h-full drop-shadow-md">
    {isNight && (
      <path d="M22 17A6.5 6.5 0 1 1 17 4A7.5 7.5 0 0 0 22 17Z" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1" strokeLinejoin="round" />
    )}
    <g fill={isNight ? "#94A3B8" : "#CBD5E1"} filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.1))">
      <rect x="5" y="12" width="22" height="10" rx="5" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="20" cy="13" r="4.5" />
    </g>
    <g fill={isNight ? "#7DD3FC" : "#38BDF8"}>
      <circle cx="10" cy="25" r="1.5" />
      <circle cx="16" cy="28" r="1.5" />
      <circle cx="22" cy="25" r="1.5" />
    </g>
  </svg>
);

export const WeatherIcon: React.FC<WeatherIconProps> = ({ typeId, isNight = false, className }) => {
  const wrapperClass = cn("inline-block", className);

  // IPMA Weather Type Class ID Mapping
  switch (true) {
    case typeId === 1: // Limpo
      return <div className={wrapperClass}>{isNight ? <Moon /> : <Sun />}</div>;
    
    case typeId === 2 || typeId === 3: // Pouco/Parcialmente Nublado
      return <div className={wrapperClass}>{isNight ? <MoonCloud /> : <SunCloud />}</div>;
      
    case typeId === 4 || typeId === 5: // Muito nublado / Encoberto
      return <div className={wrapperClass}><Cloud /></div>;
      
    case [6, 7].includes(typeId): // Light rain
      return <div className={wrapperClass}><Rain isNight={isNight} /></div>;

    case [8, 9, 10, 11, 12, 13, 14, 15].includes(typeId): // Heavy rain
      return <div className={wrapperClass}><Rain heavy isNight={isNight} /></div>;
      
    case [20, 21, 22, 23].includes(typeId): // Snow / Sleet
      return <div className={wrapperClass}><Snow isNight={isNight} /></div>;
      
    case [24, 25, 26, 27].includes(typeId): // Thunderstorms
      return <div className={wrapperClass}><Thunderstorm isNight={isNight} /></div>;

    default:
      return <div className={wrapperClass}><Cloud /></div>;
  }
};
