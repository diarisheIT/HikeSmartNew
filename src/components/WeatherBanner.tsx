import type { Weather } from "@/lib/types";

interface WeatherBannerProps {
  weather: Weather;
}

export default function WeatherBanner({ weather }: WeatherBannerProps) {
  const hasData = weather.temperature != null || weather.condition || weather.forecast;

  if (!hasData && weather.warnings.length === 0) return null;

  return (
    <div className="w-full max-w-2xl rounded-lg border border-forest-700 bg-forest-800 p-4">
      <div className="flex flex-wrap items-center gap-4">
        {weather.temperature != null && (
          <div className="flex items-center gap-1">
            <span className="text-sm text-sage-400">Temp</span>
            <span className="font-medium text-cream-50">
              {weather.temperature}C
            </span>
          </div>
        )}
        {weather.condition && (
          <div className="flex items-center gap-1">
            <span className="text-sm text-sage-400">Condition</span>
            <span className="font-medium text-cream-50">
              {weather.condition}
            </span>
          </div>
        )}
        {weather.humidity != null && (
          <div className="flex items-center gap-1">
            <span className="text-sm text-sage-400">Humidity</span>
            <span className="font-medium text-cream-50">
              {weather.humidity}%
            </span>
          </div>
        )}
        {weather.forecast && !weather.condition && (
          <div className="flex items-center gap-1">
            <span className="text-sm text-sage-400">Forecast</span>
            <span className="font-medium text-cream-50">
              {weather.forecast}
            </span>
          </div>
        )}
      </div>
      {weather.warnings.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {weather.warnings.map((warning, i) => (
            <span
              key={i}
              className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800"
            >
              {warning}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
