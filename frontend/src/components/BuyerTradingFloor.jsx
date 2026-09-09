import React, { useState, useMemo } from 'react';

const HARVEST_BATCHES = [
  {
    id: 'LOT-KA-2026-101',
    commodity: 'Sona Masuri Paddy',
    variety: 'Super Fine Aged',
    grade: 'Grade A Export',
    availableQuantity: 120,
    minOrderQty: 20,
    basePrice: 2350,
    currentHighestBid: 2480,
    totalBids: 8,
    farmer: {
      name: 'Ramesh Gowda',
      fpo: 'Mandya Organic Farmers Producer Co.',
      location: 'Mandya, Karnataka',
      rating: '4.9 ★',
      verifiedKyc: true,
    },
    qualityMetrics: {
      moisture: '11.8%',
      purity: '98.5%',
      grainLength: '5.2 mm',
      foreignMatter: '< 0.5%',
      harvestDate: 'Harvested 4 days ago',
    },
    logistics: 'Farmer arranges transport up to 50 km or loading on buyer truck',
  },
  {
    id: 'LOT-KA-2026-102',
    commodity: 'Hybrid Red Tomato',
    variety: 'Shivam Round Red',
    grade: 'Grade A+',
    availableQuantity: 65,
    minOrderQty: 10,
    basePrice: 1600,
    currentHighestBid: 1780,
    totalBids: 14,
    farmer: {
      name: 'Shivanna H.',
      fpo: 'Kolar Horticultural Cluster',
      location: 'Kolar, Karnataka',
      rating: '4.8 ★',
      verifiedKyc: true,
    },
    qualityMetrics: {
      moisture: 'N/A (Firm)',
      purity: '99.0%',
      grainLength: '60-70mm caliber',
      foreignMatter: 'Nil',
      harvestDate: 'Harvested yesterday evening',
    },
    logistics: 'Crate packaging included; ready for dispatch',
  },
  {
    id: 'LOT-KA-2026-103',
    commodity: 'Medium Staple Cotton',
    variety: 'DCH-32 Hybrid',
    grade: 'Grade A',
    availableQuantity: 95,
    minOrderQty: 25,
    basePrice: 6900,
    currentHighestBid: 7250,
    totalBids: 6,
    farmer: {
      name: 'Basavaraj Patil',
      fpo: 'North Karnataka Agro Union',
      location: 'Dharwad, Karnataka',
      rating: '4.7 ★',
      verifiedKyc: true,
    },
    qualityMetrics: {
      moisture: '7.5%',
      purity: '97.8%',
      grainLength: '29.5 mm staple',
      foreignMatter: '< 1.2% trash',
      harvestDate: 'Harvested 1 week ago',
    },
    logistics: 'Ginned bales ready at APMC licensed warehouse',
  },
  {
    id: 'LOT-KA-2026-104',
    commodity: 'Yellow Feed Maize',
    variety: 'Hybrid Grain',
    grade: 'Grade B+',
    availableQuantity: 180,
    minOrderQty: 50,
    basePrice: 2050,
    currentHighestBid: 2190,
    totalBids: 9,
    farmer: {
      name: 'Anil Kumar',
      fpo: 'Shimoga Corn Growers Association',
      location: 'Shimoga, Karnataka',
      rating: '4.6 ★',
      verifiedKyc: true,
    },
    qualityMetrics: {
      moisture: '13.2%',
      purity: '97.0%',
      grainLength: 'Bold Kernel',
      foreignMatter: '< 1.5%',
      harvestDate: 'Harvested 5 days ago',
    },
    logistics: 'Silo loading available on site',
  },
];

export default function BuyerTradingFloor() {
  const [batches, setBatches] = useState(HARVEST_BATCHES);
  const [selectedBatch, setSelectedBatch] = useState(batches[0]);
  const [activeCommodityFilter, setActiveCommodityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [orderMode, setOrderMode] = useState('bid');
  const [bidPrice, setBidPrice] = useState('2520');
  const [orderQuantity, setOrderQuantity] = useState('20');
  const [deliveryPincode, setDeliveryPincode] = useState('');
  const [tradeStatus, setTradeStatus] = useState(null);

  const commodities = useMemo(() => {
    return ['All', ...new Set(batches.map((b) => b.commodity))];
  }, [batches]);

  const filteredBatches = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return batches.filter((b) => {
      const matchCat = activeCommodityFilter === 'All' || b.commodity === activeCommodityFilter;
      const matchSearch =
        !q ||
        b.commodity.toLowerCase().includes(q) ||
        b.farmer.name.toLowerCase().includes(q) ||
        b.farmer.location.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [batches, activeCommodityFilter, searchQuery]);

  const handleSelectBatch = (batch) => {
    setSelectedBatch(batch);
    setBidPrice(String(batch.currentHighestBid + 40));
    setOrderQuantity(String(batch.minOrderQty));
    setTradeStatus(null);
  };

  const handleExecuteTrade = (e) => {
    e.preventDefault();
    const qty = Number(orderQuantity);
    const price = orderMode === 'instant_buy' ? selectedBatch.currentHighestBid : Number(bidPrice);

    if (qty < selectedBatch.minOrderQty) {
      alert(`Minimum order quantity for this lot is ${selectedBatch.minOrderQty} Quintals.`);
      return;
    }
    if (qty > selectedBatch.availableQuantity) {
      alert(`Requested quantity exceeds available batch size (${selectedBatch.availableQuantity} Quintals).`);
      return;
    }
    if (orderMode === 'bid' && price <= selectedBatch.currentHighestBid) {
      alert(`Competitive bid must exceed current highest bid of ₹${selectedBatch.currentHighestBid}/Qtl.`);
      return;
    }

    setBatches((prev) =>
      prev.map((b) => {
        if (b.id === selectedBatch.id) {
          return {
            ...b,
            currentHighestBid: price,
            totalBids: b.totalBids + 1,
            availableQuantity: orderMode === 'instant_buy' ? b.availableQuantity - qty : b.availableQuantity,
          };
        }
        return b;
      })
    );

    setTradeStatus({
      type: orderMode === 'instant_buy' ? 'Escrow Locked' : 'Bid Recorded',
      lotId: selectedBatch.id,
      commodity: selectedBatch.commodity,
      quantity: qty,
      rate: price,
      totalAmount: (qty * price).toLocaleString('en-IN'),
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.topBanner}>
        <div>
          <div style={styles.badgeRow}>
            <span style={styles.liveIndicator}>● LIVE APMC TRADING FLOOR</span>
            <span style={styles.verifiedTag}>APMC e-Procurement Escrow Enabled</span>
          </div>
          <h1 style={styles.title}>Institutional Produce Sourcing & Bulk Procurement</h1>
          <p style={styles.subtitle}>
            Direct farmer lot auctions with audited moisture, purity, and grade inspection certificates.
          </p>
        </div>

        <div style={styles.buyerCard}>
          <div style={styles.buyerRow}>
            <span style={styles.buyerLabel}>Authorized Buyer:</span>
            <span style={styles.buyerValue}>Bangalore Wholesale Agro Pvt Ltd</span>
          </div>
          <div style={styles.buyerRow}>
            <span style={styles.buyerLabel}>GSTIN / APMC Lic:</span>
            <span style={styles.buyerValue}>29AABCU9603R1ZM</span>
          </div>
          <div style={styles.buyerRow}>
            <span style={styles.buyerLabel}>Escrow Line:</span>
            <span style={styles.creditValue}>₹ 45,00,000 Available</span>
          </div>
        </div>
      </div>

      <div style={styles.toolbar}>
        <div style={styles.filterGroup}>
          {commodities.map((item) => (
            <button
              key={item}
              style={activeCommodityFilter === item ? styles.filterBtnActive : styles.filterBtn}
              onClick={() => setActiveCommodityFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Filter by Lot ID, commodity, district, or FPO..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchBox}
        />
      </div>

      <div style={styles.splitGrid}>
        <div style={styles.batchListColumn}>
          <div style={styles.columnHeader}>
            <h3 style={styles.columnTitle}>Verified Farm Lots ({filteredBatches.length})</h3>
            <span style={styles.subtext}>Click any lot to load parameters into trade terminal</span>
          </div>

          <div style={styles.batchFeed}>
            {filteredBatches.map((batch) => {
              const isSelected = selectedBatch.id === batch.id;
              return (
                <div
                  key={batch.id}
                  style={isSelected ? styles.batchCardSelected : styles.batchCard}
                  onClick={() => handleSelectBatch(batch)}
                >
                  <div style={styles.batchTop}>
                    <div>
                      <span style={styles.lotId}>{batch.id}</span>
                      <h4 style={styles.batchCommodity}>{batch.commodity}</h4>
                      <p style={styles.batchVariety}>
                        {batch.variety} • <span style={styles.gradeText}>{batch.grade}</span>
                      </p>
                    </div>
                    <div style={styles.priceColumn}>
                      <span style={styles.topBidLabel}>Highest Offer</span>
                      <span style={styles.topBidValue}>₹{batch.currentHighestBid}</span>
                      <span style={styles.baseLabel}>Base: ₹{batch.basePrice}/Qtl</span>
                    </div>
                  </div>

                  <div style={styles.metricsSummaryRow}>
                    <div style={styles.metricChip}>📦 {batch.availableQuantity} Qtl Total</div>
                    <div style={styles.metricChip}>⚖️ Min: {batch.minOrderQty} Qtl</div>
                    <div style={styles.metricChip}>💧 Moisture: {batch.qualityMetrics.moisture}</div>
                    <div style={styles.metricChip}>✨ Purity: {batch.qualityMetrics.purity}</div>
                  </div>

                  <div style={styles.farmerFooter}>
                    <span style={styles.farmerName}>🧑‍🌾 {batch.farmer.name}</span>
                    <span style={styles.farmerLoc}>📍 {batch.farmer.location}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={styles.terminalColumn}>
          <div style={styles.terminalCard}>
            <div style={styles.terminalHeader}>
              <div>
                <span style={styles.terminalTag}>TRADE EXECUTION DOCK</span>
                <h2 style={styles.terminalTitle}>{selectedBatch.commodity}</h2>
                <p style={styles.terminalSub}>Lot: {selectedBatch.id} • {selectedBatch.farmer.fpo}</p>
              </div>
              <div style={styles.kycSeal}>
                <span>🛡️ Mandi Verified</span>
              </div>
            </div>

            <div style={styles.qualitySection}>
              <h4 style={styles.qualityHeading}>Assayed Quality Certificate</h4>
              <div style={styles.qualityGrid}>
                <div style={styles.qualityCell}>
                  <span style={styles.cellLabel}>Moisture Content</span>
                  <span style={styles.cellValue}>{selectedBatch.qualityMetrics.moisture}</span>
                </div>
                <div style={styles.qualityCell}>
                  <span style={styles.cellLabel}>Grain / Fiber Purity</span>
                  <span style={styles.cellValue}>{selectedBatch.qualityMetrics.purity}</span>
                </div>
                <div style={styles.qualityCell}>
                  <span style={styles.cellLabel}>Size / Caliber</span>
                  <span style={styles.cellValue}>{selectedBatch.qualityMetrics.grainLength}</span>
                </div>
                <div style={styles.qualityCell}>
                  <span style={styles.cellLabel}>Foreign Matter</span>
                  <span style={styles.cellValue}>{selectedBatch.qualityMetrics.foreignMatter}</span>
                </div>
              </div>
              <p style={styles.harvestNote}>📅 {selectedBatch.qualityMetrics.harvestDate} • {selectedBatch.logistics}</p>
            </div>

            <form onSubmit={handleExecuteTrade} style={styles.tradeForm}>
              <div style={styles.modeToggleRow}>
                <button
                  type="button"
                  style={orderMode === 'bid' ? styles.modeBtnActive : styles.modeBtn}
                  onClick={() => setOrderMode('bid')}
                >
                  ⚡ Competitive Bid Auction
                </button>
                <button
                  type="button"
                  style={orderMode === 'instant_buy' ? styles.modeBtnActive : styles.modeBtn}
                  onClick={() => setOrderMode('instant_buy')}
                >
                  🔒 Instant Buyout (Escrow Lock)
                </button>
              </div>

              <div style={styles.inputGrid}>
                <div>
                  <label style={styles.fieldLabel}>
                    Order Volume (Quintals): <span style={styles.helperText}>(Min {selectedBatch.minOrderQty})</span>
                  </label>
                  <input
                    type="number"
                    style={styles.fieldInput}
                    min={selectedBatch.minOrderQty}
                    max={selectedBatch.availableQuantity}
                    required
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(e.target.value)}
                  />
                </div>

                <div>
                  <label style={styles.fieldLabel}>
                    {orderMode === 'bid' ? 'Your Bid Rate (₹ / Quintal):' : 'Fixed Buyout Rate (₹ / Qtl):'}
                  </label>
                  <input
                    type="number"
                    style={styles.fieldInput}
                    required
                    disabled={orderMode === 'instant_buy'}
                    value={orderMode === 'instant_buy' ? selectedBatch.currentHighestBid : bidPrice}
                    onChange={(e) => setBidPrice(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={styles.fieldLabel}>Delivery Pincode / Processing Facility:</label>
                <input
                  type="text"
                  style={styles.fieldInput}
                  required
                  placeholder="e.g. 560067 (Whitefield Industrial Hub, Bengaluru)"
                  value={deliveryPincode}
                  onChange={(e) => setDeliveryPincode(e.target.value)}
                />
              </div>

              <div style={styles.calcSummary}>
                <div style={styles.calcRow}>
                  <span>Subtotal Produce Cost:</span>
                  <b>
                    ₹
                    {(
                      (Number(orderQuantity) || 0) *
                      (orderMode === 'instant_buy' ? selectedBatch.currentHighestBid : Number(bidPrice) || 0)
                    ).toLocaleString('en-IN')}
                  </b>
                </div>
                <div style={styles.calcRow}>
                  <span>APMC Market Cess & Mandi Fee (1.5%):</span>
                  <span>
                    ₹
                    {(
                      (Number(orderQuantity) || 0) *
                      (orderMode === 'instant_buy' ? selectedBatch.currentHighestBid : Number(bidPrice) || 0) *
                      0.015
                    ).toLocaleString('en-IN')}
                  </span>
                </div>
                <div style={styles.calcDivider} />
                <div style={styles.calcTotalRow}>
                  <span>Total Escrow Commitment:</span>
                  <span style={styles.calcTotalValue}>
                    ₹
                    {(
                      (Number(orderQuantity) || 0) *
                      (orderMode === 'instant_buy' ? selectedBatch.currentHighestBid : Number(bidPrice) || 0) *
                      1.015
                    ).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button type="submit" style={styles.submitOrderBtn}>
                {orderMode === 'bid'
                  ? `Submit Competitive Bid for ${selectedBatch.commodity}`
                  : `Lock Lot with Escrow Deposit`}
              </button>
            </form>

            {tradeStatus && (
              <div style={styles.tradeReceipt}>
                <div style={styles.receiptHeader}>
                  <span style={styles.receiptCheck}>✅ {tradeStatus.type}</span>
                  <span style={styles.receiptTime}>{tradeStatus.timestamp}</span>
                </div>
                <p style={styles.receiptText}>
                  Order for <b>{tradeStatus.quantity} Quintals</b> of <b>{tradeStatus.commodity}</b> ({tradeStatus.lotId}) at{' '}
                  <b>₹{tradeStatus.rate}/Qtl</b> registered. Total commitment: <b>₹{tradeStatus.totalAmount}</b>.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '1360px', margin: '0 auto', padding: '1.5rem', fontFamily: 'system-ui, sans-serif', color: '#212121' },
  topBanner: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '1.5rem 2rem', borderRadius: '12px', border: '1px solid #e0e0e0', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1.5rem' },
  badgeRow: { display: 'flex', gap: '0.8rem', alignItems: 'center', marginBottom: '0.4rem' },
  liveIndicator: { color: '#d32f2f', fontWeight: '800', fontSize: '0.82rem' },
  verifiedTag: { backgroundColor: '#e8f5e9', color: '#1b5e20', fontSize: '0.78rem', fontWeight: '700', padding: '0.2rem 0.6rem', borderRadius: '4px' },
  title: { margin: '0 0 0.4rem 0', fontSize: '1.5rem', color: '#1b5e20', fontWeight: '800' },
  subtitle: { margin: 0, color: '#616161', fontSize: '0.9rem' },
  buyerCard: { backgroundColor: '#f1f8e9', border: '1px solid #c8e6c9', borderRadius: '8px', padding: '1rem 1.4rem', minWidth: '320px' },
  buyerRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', margin: '0.25rem 0' },
  buyerLabel: { color: '#555' },
  buyerValue: { fontWeight: '700', color: '#2e7d32' },
  creditValue: { fontWeight: '800', color: '#1b5e20' },
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' },
  filterGroup: { display: 'flex', gap: '0.5rem', overflowX: 'auto' },
  filterBtn: { padding: '0.55rem 1rem', border: '1px solid #cfd8dc', backgroundColor: '#ffffff', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.88rem', color: '#555' },
  filterBtnActive: { padding: '0.55rem 1rem', border: '1px solid #1b5e20', backgroundColor: '#1b5e20', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.88rem', color: '#ffffff' },
  searchBox: { flex: 1, minWidth: '280px', padding: '0.65rem 1rem', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#ffffff', fontSize: '0.9rem' },
  splitGrid: { display: 'grid', gridTemplateColumns: '1.1fr 1.3fr', gap: '1.5rem' },
  batchListColumn: { display: 'flex', flexDirection: 'column' },
  columnHeader: { marginBottom: '0.8rem' },
  columnTitle: { margin: '0 0 0.2rem 0', fontSize: '1.15rem', color: '#212121' },
  subtext: { fontSize: '0.82rem', color: '#757575' },
  batchFeed: { display: 'flex', flexDirection: 'column', gap: '0.9rem', maxHeight: '820px', overflowY: 'auto' },
  batchCard: { backgroundColor: '#ffffff', borderRadius: '10px', padding: '1.2rem', border: '1px solid #e0e0e0', cursor: 'pointer' },
  batchCardSelected: { backgroundColor: '#f9fbe7', borderRadius: '10px', padding: '1.2rem', border: '2px solid #1b5e20', cursor: 'pointer' },
  batchTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' },
  lotId: { fontSize: '0.75rem', fontWeight: 'bold', color: '#757575', textTransform: 'uppercase' },
  batchCommodity: { margin: '0.2rem 0', fontSize: '1.15rem', color: '#1b5e20' },
  batchVariety: { margin: 0, fontSize: '0.84rem', color: '#616161' },
  gradeText: { fontWeight: '700', color: '#2e7d32' },
  priceColumn: { textAlign: 'right' },
  topBidLabel: { display: 'block', fontSize: '0.72rem', color: '#757575', textTransform: 'uppercase' },
  topBidValue: { fontSize: '1.3rem', fontWeight: '800', color: '#1b5e20' },
  baseLabel: { display: 'block', fontSize: '0.75rem', color: '#9e9e9e' },
  metricsSummaryRow: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '0.6rem 0' },
  metricChip: { backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '0.76rem', fontWeight: '600', color: '#424242' },
  farmerFooter: { borderTop: '1px solid #eee', paddingTop: '0.6rem', marginTop: '0.4rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' },
  farmerName: { fontWeight: '600', color: '#333' },
  farmerLoc: { color: '#757575' },
  terminalColumn: { position: 'sticky', top: '1.5rem' },
  terminalCard: { backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '1.8rem' },
  terminalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' },
  terminalTag: { fontSize: '0.75rem', fontWeight: '800', color: '#1b5e20' },
  terminalTitle: { margin: '0.2rem 0', fontSize: '1.4rem', color: '#212121' },
  terminalSub: { margin: 0, fontSize: '0.86rem', color: '#616161' },
  kycSeal: { backgroundColor: '#e8f5e9', border: '1px solid #a5d6a7', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', color: '#1b5e20' },
  qualitySection: { backgroundColor: '#fafafa', border: '1px solid #eee', borderRadius: '8px', padding: '1rem', marginBottom: '1.4rem' },
  qualityHeading: { margin: '0 0 0.8rem 0', fontSize: '0.92rem', color: '#333' },
  qualityGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem' },
  qualityCell: { backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '6px', padding: '0.5rem', textAlign: 'center' },
  cellLabel: { display: 'block', fontSize: '0.72rem', color: '#757575' },
  cellValue: { display: 'block', fontSize: '0.88rem', fontWeight: '700', color: '#1b5e20', marginTop: '0.2rem' },
  harvestNote: { margin: '0.8rem 0 0 0', fontSize: '0.8rem', color: '#666' },
  tradeForm: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  modeToggleRow: { display: 'flex', gap: '0.6rem' },
  modeBtn: { flex: 1, padding: '0.7rem', border: '1px solid #ccc', backgroundColor: '#f5f5f5', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.88rem', color: '#666' },
  modeBtnActive: { flex: 1, padding: '0.7rem', border: '2px solid #1b5e20', backgroundColor: '#e8f5e9', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.88rem', color: '#1b5e20' },
  inputGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  fieldLabel: { display: 'block', fontSize: '0.84rem', fontWeight: '700', marginBottom: '0.3rem', color: '#333' },
  helperText: { fontWeight: 'normal', color: '#757575', fontSize: '0.78rem' },
  fieldInput: { width: '100%', padding: '0.65rem 0.8rem', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' },
  calcSummary: { backgroundColor: '#f1f8e9', border: '1px solid #dcedc8', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.86rem' },
  calcRow: { display: 'flex', justifyContent: 'space-between', color: '#424242' },
  calcDivider: { height: '1px', backgroundColor: '#c5e1a5', margin: '0.3rem 0' },
  calcTotalRow: { display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '0.98rem', color: '#1b5e20' },
  calcTotalValue: { fontSize: '1.15rem' },
  submitOrderBtn: { backgroundColor: '#1b5e20', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '0.95rem', fontSize: '1rem', fontWeight: '800', cursor: 'pointer' },
  tradeReceipt: { marginTop: '1.2rem', backgroundColor: '#e8f5e9', border: '1px solid #81c784', borderRadius: '8px', padding: '1rem' },
  receiptHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' },
  receiptCheck: { fontWeight: '800', color: '#1b5e20', fontSize: '0.95rem' },
  receiptTime: { fontSize: '0.78rem', color: '#666' },
  receiptText: { margin: 0, fontSize: '0.86rem', lineHeight: '1.4', color: '#2e7d32' },
};