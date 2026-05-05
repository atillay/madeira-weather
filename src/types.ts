/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WeatherType {
  descIdWeatherTypeEN: string;
  descIdWeatherTypePT: string;
  idWeatherType: number;
}

export interface City {
  idRegiao: number;
  idConcelho: number;
  idDistrito: number;
  idAreaAviso: string;
  local: string;
  globalIdLocal: number;
  latitude: string;
  longitude: string;
}

export interface DailyForecast {
  precipitaProb: string;
  tMin: string;
  tMax: string;
  predWindDir: string;
  idWeatherType: number;
  classWindSpeed: number;
  longitude: string;
  forecastDate: string;
  latitude: string;
}

export interface HourlyForecast {
  time: string;
  temp: number;
  rainProb: number;
  weatherType: number;
}

export interface Town {
  name: string;
  id: number;
  lat: number;
  lng: number;
}
