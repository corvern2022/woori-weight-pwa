"use client";

import { useEffect, useState } from "react";

type WeatherState = {
  label: string;   // 예: "맑음"
  emoji: string;   // 예: "☀️"
  temp: number | null;
  loading: boolean;
};

// WMO weather codes → 한국어 + 이모지
function decodeWeatherCode(code: number): { label: string; emoji: string } {
  if (code === 0) return { label: "맑음", emoji: "☀️" };
  if (code <= 2) return { label: "구름 조금", emoji: "🌤️" };
  if (code === 3) return { label: "흐림", emoji: "☁️" };
  if (code <= 49) return { label: "안개", emoji: "🌫️" };
  if (code <= 59) return { label: "이슬비", emoji: "🌦️" };
  if (code <= 69) return { label: "비", emoji: "🌧️" };
  if (code <= 79) return { label: "눈", emoji: "❄️" };
  if (code <= 82) return { label: "소나기", emoji: "🌦️" };
  if (code <= 86) return { label: "눈소나기", emoji: "🌨️" };
  if (code <= 99) return { label: "천둥번개", emoji: "⛈️" };
  return { label: "맑음", emoji: "☀️" };
}

export function useWeather(): WeatherState {
  const [state, setState] = useState<WeatherState>({
    label: "날씨 확인 중",
    emoji: "🌤️",
    temp: null,
    loading: true,
  });

  useEffect(() => {
    // Seoul coordinates fallback (used when geolocation is unavailable or denied)
    const SEOUL_LAT = 37.5665;
    const SEOUL_LON = 126.9780;

    async function fetchWeather(lat: number, lon: number) {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current=weather_code,temperature_2m&timezone=Asia%2FSeoul`
        );
        const data = await res.json();
        const code: number = data.current.weather_code;
        const temp: number = Math.round(data.current.temperature_2m);
        const { label, emoji } = decodeWeatherCode(code);
        setState({ label, emoji, temp, loading: false });
      } catch {
        setState(s => ({ ...s, loading: false }));
      }
    }

    if (!navigator.geolocation) {
      fetchWeather(SEOUL_LAT, SEOUL_LON);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        fetchWeather(coords.latitude, coords.longitude);
      },
      () => {
        // 위치 권한 거부 → 서울 기준으로 날씨 표시
        fetchWeather(SEOUL_LAT, SEOUL_LON);
      },
      { timeout: 6000 }
    );
  }, []);

  return state;
}
