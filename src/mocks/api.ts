import { mockListingsService } from "./listings/service";
import { mockAuctionsService } from "./auctions/service";
import { mockOffersService } from "./offers/service";
import { mockTransactionsService } from "./transactions/service";
import { mockSellerService } from "./seller/service";
import { mockNotificationsService } from "./notifications/service";
import { subscribeToMarketplace } from "./core/realtime";
import { resetMockDatabase } from "./core/database";

// Compatibility facade for the mock contract tests; feature services import their domain mock directly.
export { DomainError } from "./core/errors";

export const api = {
  ...mockListingsService,
  ...mockAuctionsService,
  ...mockOffersService,
  ...mockTransactionsService,
  ...mockSellerService,
  ...mockNotificationsService,
  subscribe: subscribeToMarketplace,
  reset: resetMockDatabase,
};
