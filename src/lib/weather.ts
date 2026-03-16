import { getCache, setCache } from "./cache";
import type { Weather } from "./types";

const BASE_URL = "https://data.weather.gov.hk/weatherAPI/opendata/weather.php";

interface HKOCurrentResponse {
  temperature?: { data?: Array<{ value: number }> };
  humidity?: { data?: Array<{ value: number }> };
  icon?: number[];
}

interface HKOForecastResponse {
  weatherForecast?: Array<{
    forecastDate?: string;
    forecastWeather?: string;
    forecastMintemp?: { value?: number };
    forecastMaxtemp?: { value?: number };
    forecastMinrh?: { value?: number };
    forecastMaxrh?: { value?: number };
  }>;
  generalSituation?: string;
}

interface HKOWarningResponse {
  [key: string]: {
    name?: string;
    type?: string;
  };
}

function getWeatherCondition(icons: number[]): string {
  if (!icons || icons.length === 0) return "Unknown";
  const icon = icons[0];
  const conditions: Record<number, string> = {
    50: "Sunny", 51: "Sunny Periods", 52: "Sunny Intervals",
    53: "Sunny Intervals with Showers", 54: "Sunny Periods with Few Showers",
    60: "Cloudy", 61: "Overcast", 62: "Light Rain", 63: "Rain",
    64: "Heavy Rain", 65: "Thunderstorms",
  };
  return conditions[icon] ?? "Partly Cloudy";
}

async function fetchCurrentWeather(): Promise<Partial<Weather>> {
  try {
    const res = await fetch(`${BASE_URL}?dataType=rhrread&lang=en`);
    const data: HKOCurrentResponse = await res.json();

    return {
      temperature: data.temperature?.data?.[0]?.value ?? null,
      humidity: data.humidity?.data?.[0]?.value ?? null,
      condition: data.icon ? getWeatherCondition(data.icon) : null,
    };
  } catch {
    return { temperature: null, humidity: null, condition: null };
  }
}

async function fetchForecast(dateStr: string): Promise<Partial<Weather>> {
  try {
    const res = await fetch(`${BASE_URL}?dataType=fnd&lang=en`);
    const data: HKOForecastResponse = await res.json();

    const targetDate = dateStr.replace(/-/g, "");
    const dayForecast = data.weatherForecast?.find(
      (f) => f.forecastDate === targetDate
    );

    if (dayForecast) {
      const minTemp = dayForecast.forecastMintemp?.value;
      const maxTemp = dayForecast.forecastMaxtemp?.value;
      const avgTemp = minTemp != null && maxTemp != null ? Math.round((minTemp + maxTemp) / 2) : null;
      const minRh = dayForecast.forecastMinrh?.value;
      const maxRh = dayForecast.forecastMaxrh?.value;
      const avgRh = minRh != null && maxRh != null ? Math.round((minRh + maxRh) / 2) : null;

      return {
        temperature: avgTemp,
        humidity: avgRh,
        condition: dayForecast.forecastWeather ?? null,
        forecast: dayForecast.forecastWeather ?? null,
      };
    }

    return {
      temperature: null,
      humidity: null,
      condition: null,
      forecast: data.generalSituation ?? null,
    };
  } catch {
    return { temperature: null, humidity: null, condition: null, forecast: null };
  }
}

async function fetchWarnings(): Promise<string[]> {
  try {
    const res = await fetch(`${BASE_URL}?dataType=warnsum&lang=en`);
    const data: HKOWarningResponse = await res.json();

    return Object.values(data)
      .filter((w) => w && typeof w === "object" && w.name)
      .map((w) => w.name!);
  } catch {
    return [];
  }
}

export async function getWeather(dateStr: string): Promise<Weather> {
  const cacheKey = `hk_weather:${dateStr}`;
  const cached = await getCache<Weather>(cacheKey);
  if (cached) return cached;

  const today = new Date().toISOString().split("T")[0];
  const targetDate = new Date(dateStr);
  const todayDate = new Date(today);
  const diffDays = Math.ceil(
    (targetDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  let weather: Weather;

  if (diffDays <= 0) {
    // Today: use current weather
    const [current, warnings] = await Promise.all([
      fetchCurrentWeather(),
      fetchWarnings(),
    ]);
    weather = {
      temperature: current.temperature ?? null,
      condition: current.condition ?? null,
      humidity: current.humidity ?? null,
      forecast: null,
      warnings,
    };
  } else if (diffDays <= 9) {
    // Within 9-day forecast
    const [forecastData, warnings] = await Promise.all([
      fetchForecast(dateStr),
      fetchWarnings(),
    ]);
    weather = {
      temperature: forecastData.temperature ?? null,
      condition: forecastData.condition ?? null,
      humidity: forecastData.humidity ?? null,
      forecast: forecastData.forecast ?? null,
      warnings,
    };
  } else {
    weather = {
      temperature: null,
      condition: null,
      humidity: null,
      forecast: "Weather forecast unavailable for dates beyond 9 days",
      warnings: [],
    };
  }

  await setCache(cacheKey, weather, 21600);
  return weather;
}
