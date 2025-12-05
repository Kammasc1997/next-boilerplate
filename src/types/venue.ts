import { z } from 'zod';

export const venueSchema = z.object({
  id: z.string(),
  placeId: z.string(),
  name: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  userRatingsTotal: z.number().int().optional(),
  photos: z.array(z.string()).optional(),
  hasOutdoorSeating: z.boolean().default(false),
  isOpenNow: z.boolean().optional(),
  openingHours: z.array(z.string()).optional(),
  currentOpeningHours: z.string().optional(),
  notes: z.string().optional(),
});

export type Venue = z.infer<typeof venueSchema>;

export const venueWithWeatherSchema = venueSchema.extend({
  weather: z.object({
    current: z.object({
      cloudCover: z.number().min(0).max(100).optional(),
      sunVisible: z.boolean().optional(),
      timestamp: z.string().optional(),
    }).optional(),
    forecast: z.array(z.object({
      cloudCover: z.number().min(0).max(100),
      sunVisible: z.boolean(),
      validFrom: z.string(),
      validTo: z.string(),
    })).optional(),
  }).optional(),
});

export type VenueWithWeather = z.infer<typeof venueWithWeatherSchema>;

export type VenueStatus = 'open' | 'closed' | 'unknown';

export type VenueFilter = 'all' | 'open-now' | 'sun-now' | 'sun-later' | 'outdoor-seating';

