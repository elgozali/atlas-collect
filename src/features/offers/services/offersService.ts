import { mockOffersService } from "../../../mocks/offers/service";

export const offersApi = {
  getOffers: mockOffersService.getOffers,
  offer: mockOffersService.offer,
  offerAction: mockOffersService.offerAction,
};
