import { z } from 'zod';

export const dmiObservationSchema = z.object({
  stationId: z.string(),
  parameterId: z.string(),
  value: z.number(),
  quality: z.string().optional(),
  timeObs: z.string(),
});

export type DmiObservation = z.infer<typeof dmiObservationSchema>;

export const dmiForecastSchema = z.object({
  parameterId: z.string(),
  value: z.number(),
  validFrom: z.string(),
  validTo: z.string(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
});

export type DmiForecast = z.infer<typeof dmiForecastSchema>;

export const sunStatusSchema = z.object({
  sunVisible: z.boolean(),
  sunAltitude: z.number(),
  cloudCover: z.number().min(0).max(100).optional(),
  timestamp: z.string(),
});

export type SunStatus = z.infer<typeof sunStatusSchema>;

export const weatherForecastSchema = z.object({
  cloudCover: z.number().min(0).max(100),
  sunVisible: z.boolean(),
  sunAltitude: z.number(),
  validFrom: z.string(),
  validTo: z.string(),
});

export type WeatherForecast = z.infer<typeof weatherForecastSchema>;

