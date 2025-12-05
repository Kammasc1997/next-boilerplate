import { z } from 'zod';

export const googlePlaceSchema = z.object({
  place_id: z.string(),
  name: z.string(),
  geometry: z.object({
    location: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
  }),
  vicinity: z.string().optional(),
  rating: z.number().optional(),
  user_ratings_total: z.number().optional(),
  photos: z.array(z.object({
    photo_reference: z.string(),
    height: z.number().optional(),
    width: z.number().optional(),
  })).optional(),
  opening_hours: z.object({
    open_now: z.boolean().optional(),
    weekday_text: z.array(z.string()).optional(),
  }).optional(),
  current_opening_hours: z.object({
    open_now: z.boolean().optional(),
    weekday_text: z.array(z.string()).optional(),
  }).optional(),
  types: z.array(z.string()).optional(),
});

export type GooglePlace = z.infer<typeof googlePlaceSchema>;

export const googlePlacesResponseSchema = z.object({
  results: z.array(googlePlaceSchema),
  status: z.string(),
  error_message: z.string().optional(),
});

export type GooglePlacesResponse = z.infer<typeof googlePlacesResponseSchema>;

export const googlePlaceDetailsSchema = googlePlaceSchema.extend({
  formatted_address: z.string().optional(),
  formatted_phone_number: z.string().optional(),
  website: z.string().optional(),
  utc_offset: z.number().optional(),
});

export type GooglePlaceDetails = z.infer<typeof googlePlaceDetailsSchema>;

