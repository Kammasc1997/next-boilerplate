import { googlePlaceSchema, googlePlaceDetailsSchema, googlePlacesResponseSchema } from '@/types/google';
import type { GooglePlace, GooglePlaceDetails, GooglePlacesResponse } from '@/types/google';

export function isGooglePlace(obj: unknown): obj is GooglePlace {
  return googlePlaceSchema.safeParse(obj).success;
}

export function isGooglePlaceDetails(obj: unknown): obj is GooglePlaceDetails {
  return googlePlaceDetailsSchema.safeParse(obj).success;
}

export function isGooglePlacesResponse(obj: unknown): obj is GooglePlacesResponse {
  return googlePlacesResponseSchema.safeParse(obj).success;
}

export function validateGooglePlace(place: unknown): GooglePlace {
  return googlePlaceSchema.parse(place);
}

export function validateGooglePlaceDetails(details: unknown): GooglePlaceDetails {
  return googlePlaceDetailsSchema.parse(details);
}

export function validateGooglePlacesResponse(response: unknown): GooglePlacesResponse {
  return googlePlacesResponseSchema.parse(response);
}

