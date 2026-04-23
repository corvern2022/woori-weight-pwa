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
    if (!navigator.geolocation) {
      setState(s => ({ ...s, loading: false }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude.toFixed(4)}&longitude=${coords.longitude.toFixed(4)}&current=weather_code,temperature_2m&timezone=Asia%2FSeoul`
          );
          const data = await res.json();
          const code: number = data.current.weather_code;
          const temp: number = Math.round(data.current.temperature_2m);
          const { label, emoji } = decodeWeatherCode(code);
          setState({ label, emoji, temp, loading: false });
        } catch {
          setState(s => ({ ...s, loading: false }));
        }
      },
      () => {
        // 위치 권한 거부 → 기본값 유지
        setState(s => ({ ...s, loading: false }));
      },
      { timeout: 6000 }
    );
  }, []);

  return state;
}
