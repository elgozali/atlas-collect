import { mockAuctionsService } from "../../../mocks/auctions/service";

export const auctionsApi = {
  getAuction: mockAuctionsService.getAuction,
  bid: mockAuctionsService.bid,
  competitor: mockAuctionsService.competitor,
  closeAuction: mockAuctionsService.closeAuction,
  finalWindow: mockAuctionsService.finalWindow,
};
