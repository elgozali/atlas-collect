import { mockListingsService } from "../../../mocks/listings/service";

export const listingsApi = {
  getListings: mockListingsService.getListings,
  getListing: mockListingsService.getListing,
  purchase: mockListingsService.purchase,
};
