import { API_BASE_URL } from '../constants/api';

export const marketplaceService = {
  async getLots() {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      const json = await response.json();
      if (json.success && json.products) {
        return json.products.map((p) => ({
          id: p._id,
          farmerName: p.farmerName,
          location: p.location,
          commodity: p.cropName,
          category: 'Cereals',
          quantity: p.quantity,
          basePrice: `₹ ${p.pricePerQuintal} / Qtl`,
          currentBid: p.bids && p.bids.length > 0 
            ? `₹ ${p.bids[p.bids.length - 1].bidAmount} / Qtl` 
            : `₹ ${p.pricePerQuintal} / Qtl`,
          totalBids: p.bids ? p.bids.length : 0,
          harvestDate: 'Verified Lot',
          qualityGrade: 'Grade A',
          status: 'Live Bidding',
        }));
      }
      return [];
    } catch (err) {
      console.warn('Backend offline or unreachable, falling back to local storage', err);
      return [];
    }
  },

  async createLot(lotData) {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cropName: lotData.commodity,
        quantity: lotData.quantity,
        farmerName: lotData.farmerName || 'Registered Farmer',
        location: lotData.location || 'Karnataka',
        pricePerQuintal: Number(String(lotData.basePrice).replace(/[^0-9]/g, '')) || 2000,
      }),
    });
    return await response.json();
  },

  async submitBid(productId, buyerName, bidAmount) {
    const response = await fetch(`${API_BASE_URL}/products/${productId}/bid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buyerName,
        bidAmount: Number(String(bidAmount).replace(/[^0-9]/g, '')),
      }),
    });
    return await response.json();
  },
};