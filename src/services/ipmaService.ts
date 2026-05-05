/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HourlyForecast, Town, WeatherType, DailyForecast } from '../types';

const BASE_URL = 'https://api.ipma.pt/open-data';

export const TOWNS: Town[] = [
  { name: 'Areeiro', id: 2310921, lat: 32.7354, lng: -16.9286 },
  { name: 'Bica da Cana', id: 2310521, lat: 32.7550, lng: -17.0570 },
  { name: 'Calheta', id: 1100100, lat: 32.7233, lng: -17.1783 },
  { name: 'Câmara de Lobos', id: 2310200, lat: 32.6483, lng: -16.9733 },
  { name: 'Caniçal', id: 2310424, lat: 32.7360, lng: -16.7370 },
  { name: 'Funchal', id: 2310300, lat: 32.6500, lng: -16.9080 },
  { name: 'Funchal/Lido', id: 2310321, lat: 32.6375, lng: -16.9320 },
  { name: 'Lugar de Baixo', id: 2310522, lat: 32.6800, lng: -17.0890 },
  { name: 'Machico', id: 2310400, lat: 32.7183, lng: -16.7667 },
  { name: 'Ponta do Pargo', id: 2310123, lat: 32.8140, lng: -17.2620 },
  { name: 'Ponta do Sol', id: 1100500, lat: 32.6800, lng: -17.1033 },
  { name: 'Porto Moniz', id: 2310600, lat: 32.8667, lng: -17.1667 },
  { name: 'Porto Santo', id: 1100900, lat: 33.0600, lng: -16.3300 },
  { name: 'Ribeira Brava', id: 1101100, lat: 32.6717, lng: -17.0650 },
  { name: 'Santa Cruz', id: 1100800, lat: 32.6883, lng: -16.7917 },
  { name: 'Santa Cruz - Aer.', id: 2310800, lat: 32.6930, lng: -16.7740 },
  { name: 'Santana', id: 2310900, lat: 32.8050, lng: -16.8833 },
  { name: 'Santo da Serra', id: 2310421, lat: 32.7230, lng: -16.8170 },
  { name: 'São Vicente', id: 2311000, lat: 32.8028, lng: -17.0425 },
];

export async function getWeatherTypes(): Promise<WeatherType[]> {
  const response = await fetch(`${BASE_URL}/weather-type-classe.json`);
  const data = await response.json();
  return data.data;
}

export async function getDailyForecast(cityId: number): Promise<DailyForecast[]> {
  const response = await fetch(`${BASE_URL}/forecast/meteorology/cities/daily/${cityId}.json`);
  const data = await response.json();
  return data.data;
}

export async function getHourlyForecast(cityId: number): Promise<HourlyForecast[]> {
  try {
    const response = await fetch(`https://api.ipma.pt/public-data/forecast/aggregate/${cityId}.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Filter out only the hourly forecasts (idPeriodo === 1)
    const hourlyData = data.filter((item: any) => item.idPeriodo === 1);
    
    return hourlyData.map((item: any) => ({
      time: item.dataPrev,
      temp: parseFloat(item.tMed),
      rainProb: parseFloat(item.probabilidadePrecipita),
      weatherType: item.idTipoTempo,
    })).sort((a: HourlyForecast, b: HourlyForecast) => a.time.localeCompare(b.time));
    
  } catch (err) {
    console.error("Error fetching hourly data:", err);
    return [];
  }
}
