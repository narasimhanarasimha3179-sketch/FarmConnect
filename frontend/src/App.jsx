import React, { useState, useEffect, useMemo, useRef } from 'react';
import BuyerTradingFloor from './components/BuyerTradingFloor';

const API_BASE = 'http://localhost:5000/api';

const MANDI_PRICES = [
  { id: 'm1', crop: 'Tomato (Hybrid)', mandi: 'Kolar APMC', state: 'Karnataka', price: '₹2,400', change: '+5.2%', up: true, emoji: '🍅' },
  { id: 'm2', crop: 'Paddy (Sona Masuri)', mandi: 'Mandya APMC', state: 'Karnataka', price: '₹2,450', change: '+3.2%', up: true, emoji: '🌾' },
  { id: 'm3', crop: 'Cotton (Medium Staple)', mandi: 'Dharwad APMC', state: 'Karnataka', price: '₹7,150', change: '+4.1%', up: true, emoji: '☁️' },
  { id: 'm4', crop: 'Onion (Nashik Red)', mandi: 'Lasalgaon APMC', state: 'Maharashtra', price: '₹1,800', change: '+3.1%', up: true, emoji: '🧅' },
  { id: 'm5', crop: 'Maize (Yellow Feed)', mandi: 'Davanagere APMC', state: 'Karnataka', price: '₹2,180', change: '+0.9%', up: true, emoji: '🌽' },
  { id: 'm6', crop: 'Green Chilli', mandi: 'Guntur APMC', state: 'Andhra Pradesh', price: '₹4,100', change: '+2.0%', up: true, emoji: '🌶️' },
];

const AGRI_SUPPLIES = [
  { id: 's1', title: 'Certified Hybrid Tomato Seeds (100g)', category: 'Seeds', price: '₹ 450', seller: 'Kisan Krishi Kendra', stock: '42 packs' },
  { id: 's2', title: 'Bio NPK Organic Fertilizer (50kg)', category: 'Fertilizers', price: '₹ 1,150', seller: 'Green Earth Bio Inputs', stock: '18 bags' },
  { id: 's3', title: 'Neem Oil Botanical Pesticide (1L)', category: 'Pesticides', price: '₹ 380', seller: 'Sri Manjunatha Agro', stock: '60 bottles' },
  { id: 's4', title: 'Battery Knapsack Sprayer 16L', category: 'Tools', price: '₹ 2,499', seller: 'Deccan Farm Machinery', stock: '9 units' },
];

const WEATHER_DATA = {
  location: 'Mandya & Bengaluru Rural, Karnataka',
  temp: '28°C',
  condition: 'Scattered Monsoon Clouds',
  humidity: '74%',
  rainProbability: '85%',
  rainTimeline: [
    { time: 'Now (01:00 PM)', status: 'Cloudy (25%)', advisory: 'Ideal for harvesting' },
    { time: '02:30 PM', status: 'Dense Overcast (55%)', advisory: 'Prepare field covers' },
    { time: '04:00 PM', status: 'Moderate to Heavy Rain (85%)', advisory: '⚠️ Rain arriving. Stop spraying pesticides' },
    { time: '06:30 PM', status: 'Light Showers (40%)', advisory: 'Maintain drainage canals' },
  ],
};

const DIAGNOSES_FOLIAGE = [
  {
    target: 'Tomato Leaf',
    issue: 'Early Blight (Alternaria solani)',
    severity: 'Moderate',
    symptoms: 'Brown concentric target-board lesions on older foliage with yellow halos.',
    remedy: 'Spray Mancozeb 75% WP (2.5g/L) or neem seed kernel extract (5%). Prune lower leaves.',
  },
  {
    target: 'Paddy / Rice Leaf',
    issue: 'Bacterial Leaf Blight (Xanthomonas oryzae)',
    severity: 'High',
    symptoms: 'Yellow-to-white wavy margins with dry blighted tips.',
    remedy: 'Apply Streptocycline (1.5g) with Copper Oxychloride (25g) per 10L water. Reduce excess nitrogen.',
  },
];

const DIAGNOSES_SOIL = [
  {
    target: 'Red Loamy Soil',
    issue: 'Mild Nitrogen & Humus Depletion',
    severity: 'Medium',
    symptoms: 'Dry surface crusted texture, low moisture retention, moderate aeration.',
    remedy: 'Incorporate 4-5 tonnes/acre of decomposed farmyard manure (FYM) or vermicompost with bio-fertilizers.',
  },
  {
    target: 'Black Cotton Soil',
    issue: 'Adequate Moisture, High Clay Compaction',
    severity: 'Optimal',
    symptoms: 'High water holding capacity, deep shrinkage cracks, suitable for cotton/maize.',
    remedy: 'Apply gypsum to enhance drainage and avoid water stagnation during peak monsoon.',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('marketplace');
  const [userRole, setUserRole] = useState('farmer');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Modals
  const [showLotModal, setShowLotModal] = useState(false);
  const [bidModalItem, setBidModalItem] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [buyerName, setBuyerName] = useState('');

  const [newLot, setNewLot] = useState({
    cropName: '',
    quantity: '',
    farmerName: 'Narasimha',
    location: 'Karnataka',
    pricePerQuintal: '',
  });

  // Scanner & Camera state
  const [scanType, setScanType] = useState('foliage');
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/products`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Stop camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setCapturedImage(null);
      setScanResult(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'environment' },
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      showToast('Camera permission denied or camera not found on this device.');
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');
    setCapturedImage(dataUrl);
    stopCamera();
    runDiagnosis(dataUrl);
  };

  const runDiagnosis = (imgUrl) => {
    setAnalyzing(true);
    setTimeout(() => {
      const bank = scanType === 'foliage' ? DIAGNOSES_FOLIAGE : DIAGNOSES_SOIL;
      const result = bank[Math.floor(Math.random() * bank.length)];
      setScanResult(result);
      setAnalyzing(false);
      showToast(`Diagnostic scan complete for ${scanType.toUpperCase()}`);
    }, 1200);
  };

  const handleCreateLot = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLot),
      });
      const data = await res.json();
      if (data.success) {
        setShowLotModal(false);
        setNewLot({ cropName: '', quantity: '', farmerName: 'Narasimha', location: 'Karnataka', pricePerQuintal: '' });
        fetchProducts();
        showToast('Harvest lot submitted successfully to bidding floor!');
      }
    } catch (err) {
      showToast('Error creating harvest listing.');
    }
  };

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!bidModalItem || !bidAmount || !buyerName) return;

    try {
      const res = await fetch(`${API_BASE}/products/${bidModalItem._id}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerName, bidAmount: Number(bidAmount) }),
      });
      const data = await res.json();
      if (data.success) {
        setBidModalItem(null);
        setBidAmount('');
        setBuyerName('');
        fetchProducts();
        showToast(`Counter-bid of ₹${bidAmount} accepted by system!`);
      } else {
        showToast(data.error || 'Bid rejected: Enter amount higher than current bid.');
      }
    } catch (err) {
      showToast('Network error while recording bid.');
    }
  };

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.cropName.toLowerCase().includes(q) ||
        p.farmerName.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  return (
    <div style={styles.appContainer}>
      {/* Toast Notification */}
      {toastMessage ? <div style={styles.toast}>{toastMessage}</div> : null}

      {/* Main Header */}
      <header style={styles.header}>
        <div style={styles.brandGroup}>
          <span style={styles.logoIcon}>🌱</span>
          <div>
            <h1 style={styles.brandTitle}>FarmConnect Portal</h1>
            <p style={styles.brandSubtitle}>Mandi Intelligence • B2B Procurement • AI Plant & Soil Scanner</p>
          </div>
        </div>

        <div style={styles.roleGroup}>
          <span style={styles.roleLabel}>Logged-in Role:</span>
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
            style={styles.roleSelect}
          >
            <option value="farmer">🌾 Farmer (Producer)</option>
            <option value="buyer">💼 APMC Buyer / Trader</option>
            <option value="agri_seller">🛍️ Agri Supplies Dealer</option>
            <option value="expert">🔬 Agri Expert / Agronomist</option>
          </select>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav style={styles.tabNav}>
        <button
          style={activeTab === 'mandi' ? styles.tabBtnActive : styles.tabBtn}
          onClick={() => { stopCamera(); setActiveTab('mandi'); }}
        >
          📊 Mandi Intelligence
        </button>
        {(userRole === 'farmer' || userRole === 'buyer' || userRole === 'expert') && (
          <button
            style={activeTab === 'marketplace' ? styles.tabBtnActive : styles.tabBtn}
            onClick={() => { stopCamera(); setActiveTab('marketplace'); }}
          >
            🌾 {userRole === 'buyer' ? 'Live Lots Feed' : 'Farmer Marketplace'}
          </button>
        )}
        <button
          style={activeTab === 'procurement' ? styles.tabBtnActive : styles.tabBtn}
          onClick={() => { stopCamera(); setActiveTab('procurement'); }}
        >
          💼 B2B Institutional Procurement
        </button>
        {(userRole === 'farmer' || userRole === 'agri_seller' || userRole === 'buyer') && (
          <button
            style={activeTab === 'supplies' ? styles.tabBtnActive : styles.tabBtn}
            onClick={() => { stopCamera(); setActiveTab('supplies'); }}
          >
            🛍️ {userRole === 'agri_seller' ? 'My Store Catalog' : 'Agri Inputs & Tools'}
          </button>
        )}
        {(userRole === 'farmer' || userRole === 'expert') && (
          <button
            style={activeTab === 'scanner' ? styles.tabBtnActive : styles.tabBtn}
            onClick={() => setActiveTab('scanner')}
          >
            📷 AI Foliage & Soil Scanner
          </button>
        )}
        <button
          style={activeTab === 'weather' ? styles.tabBtnActive : styles.tabBtn}
          onClick={() => { stopCamera(); setActiveTab('weather'); }}
        >
          🌧️ Rain & Weather Advisory
        </button>
      </nav>

      {/* Tab Panels */}
      <main style={styles.content}>
        {/* Mandi Intelligence */}
        {activeTab === 'mandi' && (
          <div>
            <h2 style={styles.sectionHeader}>📊 Real-time APMC Mandi Benchmark Rates</h2>
            <div style={styles.mandiGrid}>
              {MANDI_PRICES.map((m) => (
                <div key={m.id} style={styles.mandiCard}>
                  <div style={styles.cardHeader}>
                    <span style={styles.cropTitle}>
                      {m.emoji} {m.crop}
                    </span>
                    <span style={m.up ? styles.trendUp : styles.trendDown}>{m.change}</span>
                  </div>
                  <p style={styles.mandiSub}>{m.mandi} • {m.state}</p>
                  <p style={styles.mandiPrice}>{m.price} <span style={styles.unit}>/ quintal</span></p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Farmer Marketplace Feed */}
        {activeTab === 'marketplace' && (
          <div>
            <div style={styles.actionHeader}>
              <div>
                <h2 style={styles.sectionHeader}>🌾 Live Harvest Lots (Direct from Farmers)</h2>
                <p style={styles.subtext}>Inspect quality grades, moisture, and place transparent counter-bids</p>
              </div>
              {userRole === 'farmer' && (
                <button style={styles.primaryBtn} onClick={() => setShowLotModal(true)}>
                  + Post Harvest Lot
                </button>
              )}
            </div>

            <input
              type="text"
              placeholder="Search crop, farmer name, or APMC district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />

            <div style={styles.lotGrid}>
              {loading ? (
                <p>Loading lots...</p>
              ) : filteredProducts.length === 0 ? (
                <p>No listings found.</p>
              ) : (
                filteredProducts.map((p) => {
                  const highestBid =
                    p.bids && p.bids.length > 0
                      ? p.bids[p.bids.length - 1].bidAmount
                      : p.pricePerQuintal;

                  return (
                    <div key={p._id} style={styles.lotCard}>
                      <div style={styles.cardHeader}>
                        <h3 style={styles.lotTitle}>{p.cropName}</h3>
                        <span style={styles.gradeBadge}>Grade A</span>
                      </div>
                      <p style={styles.lotMeta}>
                        Farmer: <b>{p.farmerName}</b> • 📍 {p.location}
                      </p>
                      <p style={styles.lotQuantity}>📦 Quantity: {p.quantity}</p>

                      <div style={styles.bidBox}>
                        <div>
                          <span style={styles.label}>Base Rate:</span>
                          <span style={styles.baseVal}>₹{p.pricePerQuintal}/Qtl</span>
                        </div>
                        <div>
                          <span style={styles.label}>Top Bid ({p.bids ? p.bids.length : 0}):</span>
                          <span style={styles.topVal}>₹{highestBid}/Qtl</span>
                        </div>
                      </div>

                      <button
                        style={styles.bidBtn}
                        onClick={() => {
                          setBidModalItem(p);
                          setBidAmount(String(highestBid + 50));
                        }}
                      >
                        {userRole === 'buyer' ? 'Place Higher Bid' : 'Inspect Bids'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Dedicated B2B Institutional Procurement Page */}
        {activeTab === 'procurement' && <BuyerTradingFloor />}

        {/* Agri Supplies */}
        {activeTab === 'supplies' && (
          <div>
            <div style={styles.actionHeader}>
              <div>
                <h2 style={styles.sectionHeader}>🛍️ Agricultural Supplies & Machinery</h2>
                <p style={styles.subtext}>
                  {userRole === 'agri_seller'
                    ? 'Dealer inventory and direct order requests'
                    : 'Order certified inputs directly from verified dealers'}
                </p>
              </div>
            </div>

            <div style={styles.mandiGrid}>
              {AGRI_SUPPLIES.map((s) => (
                <div key={s.id} style={styles.lotCard}>
                  <h3 style={styles.lotTitle}>{s.title}</h3>
                  <p style={styles.lotMeta}>Dealer: {s.seller}</p>
                  <p style={styles.lotQuantity}>Category: {s.category} • {s.stock}</p>
                  <p style={styles.storePrice}>{s.price}</p>
                  <button
                    style={styles.bidBtn}
                    onClick={() => showToast(`Order inquiry submitted to ${s.seller} for ${s.title}`)}
                  >
                    {userRole === 'agri_seller' ? 'Update Inventory' : 'Order from Dealer'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Camera Foliage & Soil Scanner */}
        {activeTab === 'scanner' && (
          <div style={styles.scannerWrapper}>
            <h2 style={styles.sectionHeader}>📷 AI Crop Foliage & Soil Health Camera</h2>
            <p style={styles.subtext}>Turn on your camera to diagnose plant leaf diseases or inspect soil condition</p>

            <div style={styles.scanTypeRow}>
              <button
                style={scanType === 'foliage' ? styles.typeBtnActive : styles.typeBtn}
                onClick={() => { setScanType('foliage'); setScanResult(null); }}
              >
                🌿 Crop Leaf Disease
              </button>
              <button
                style={scanType === 'soil' ? styles.typeBtnActive : styles.typeBtn}
                onClick={() => { setScanType('soil'); setScanResult(null); }}
              >
                🧱 Soil Texture & Fertility
              </button>
            </div>

            <div style={styles.cameraBox}>
              {!cameraActive && !capturedImage && (
                <div style={styles.cameraPlaceholder}>
                  <p style={{ fontSize: '3rem', margin: 0 }}>📷</p>
                  <p style={{ fontWeight: '600', color: '#444' }}>Camera is currently off</p>
                  <button style={styles.primaryBtn} onClick={startCamera}>
                    Open Camera Viewfinder
                  </button>
                </div>
              )}

              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{
                  width: '100%',
                  maxHeight: '380px',
                  backgroundColor: '#000',
                  borderRadius: '8px',
                  display: cameraActive ? 'block' : 'none',
                }}
              />

              {capturedImage && (
                <div style={{ textAlign: 'center' }}>
                  <img
                    src={capturedImage}
                    alt="Captured specimen"
                    style={{ width: '100%', maxHeight: '340px', objectFit: 'contain', borderRadius: '8px' }}
                  />
                  <div style={{ marginTop: '0.8rem' }}>
                    <button style={styles.secondaryBtn} onClick={startCamera}>
                      🔄 Retake Photo
                    </button>
                  </div>
                </div>
              )}

              <canvas ref={canvasRef} style={{ display: 'none' }} />

              {cameraActive && (
                <div style={styles.cameraControls}>
                  <button style={styles.captureCircleBtn} onClick={captureFrame}>
                    📸 Snap & Diagnose
                  </button>
                  <button style={styles.cancelBtn} onClick={stopCamera}>
                    Close Camera
                  </button>
                </div>
              )}
            </div>

            {analyzing && <p style={styles.loadingText}>Running AI Computer Vision model on {scanType} specimen...</p>}

            {scanResult && (
              <div style={styles.diagCard}>
                <div style={styles.diagHeader}>
                  <span style={styles.diagTag}>{scanType.toUpperCase()} DIAGNOSIS</span>
                  <span style={styles.severityBadge}>Severity: {scanResult.severity}</span>
                </div>
                <h3 style={{ margin: '0.5rem 0', color: '#1b5e20' }}>Target: {scanResult.target}</h3>
                <h4 style={{ margin: '0.3rem 0', color: '#333' }}>Issue: {scanResult.issue}</h4>
                <p style={{ color: '#555', fontSize: '0.95rem' }}><b>Visual Traits:</b> {scanResult.symptoms}</p>
                <div style={styles.remedyBox}>
                  <b>Recommended Action:</b>
                  <p style={{ margin: '0.3rem 0 0 0' }}>{scanResult.remedy}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rain & Weather Advisory */}
        {activeTab === 'weather' && (
          <div>
            <h2 style={styles.sectionHeader}>🌧️ Real-time Rain Forecasting & Agro-Advisory</h2>
            <p style={styles.subtext}>Know when rain will arrive before harvesting, irrigation, or fertilizer application</p>

            <div style={styles.weatherSummaryCard}>
              <div>
                <span style={styles.weatherBadge}>Active Station: {WEATHER_DATA.location}</span>
                <h1 style={styles.weatherTemp}>{WEATHER_DATA.temp}</h1>
                <p style={styles.weatherDesc}>☁️ {WEATHER_DATA.condition}</p>
              </div>
              <div style={styles.weatherMeta}>
                <p>💧 <b>Relative Humidity:</b> {WEATHER_DATA.humidity}</p>
                <p>☔ <b>Rain Probability Today:</b> <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>{WEATHER_DATA.rainProbability}</span></p>
                <p>⚠️ <b>Immediate Advisory:</b> Rain expected in ~3 hours. Finish chemical sprays immediately.</p>
              </div>
            </div>

            <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>⏱️ Hourly Rain Arrival Timeline</h3>
            <div style={styles.timelineGrid}>
              {WEATHER_DATA.rainTimeline.map((slot, idx) => (
                <div key={idx} style={styles.timelineCard}>
                  <div style={styles.timelineTime}>{slot.time}</div>
                  <div style={styles.timelineStatus}>{slot.status}</div>
                  <div style={styles.timelineAdvisory}>{slot.advisory}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Post Lot Modal */}
      {showLotModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={{ color: '#1b5e20', marginTop: 0 }}>🌾 Post Harvest Lot for Auction</h3>
            <form onSubmit={handleCreateLot}>
              <label style={styles.formLabel}>Crop Name:</label>
              <input
                style={styles.formInput}
                required
                placeholder="e.g. Sona Masuri Paddy"
                value={newLot.cropName}
                onChange={(e) => setNewLot({ ...newLot, cropName: e.target.value })}
              />

              <label style={styles.formLabel}>Quantity Available:</label>
              <input
                style={styles.formInput}
                required
                placeholder="e.g. 100 Quintals"
                value={newLot.quantity}
                onChange={(e) => setNewLot({ ...newLot, quantity: e.target.value })}
              />

              <label style={styles.formLabel}>Base Price per Quintal (₹):</label>
              <input
                type="number"
                style={styles.formInput}
                required
                placeholder="2200"
                value={newLot.pricePerQuintal}
                onChange={(e) => setNewLot({ ...newLot, pricePerQuintal: e.target.value })}
              />

              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowLotModal(false)} style={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" style={styles.primaryBtn}>
                  Publish Lot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bidding Modal */}
      {bidModalItem && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={{ color: '#1b5e20', marginTop: 0 }}>💼 Place Counter-Bid</h3>
            <p style={{ color: '#555', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Bidding on: <b>{bidModalItem.cropName}</b> by {bidModalItem.farmerName}
            </p>

            <form onSubmit={handlePlaceBid}>
              <label style={styles.formLabel}>Your Trader / Buyer Name:</label>
              <input
                style={styles.formInput}
                required
                placeholder="e.g. Bangalore Agro Traders"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
              />

              <label style={styles.formLabel}>Your Bid Rate (₹ per Quintal):</label>
              <input
                type="number"
                style={styles.formInput}
                required
                placeholder="Amount in Rupees"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
              />

              <div style={styles.modalActions}>
                <button type="button" onClick={() => setBidModalItem(null)} style={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" style={styles.primaryBtn}>
                  Submit Counter-Bid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  appContainer: { minHeight: '100vh', backgroundColor: '#f4f6f8', fontFamily: 'system-ui, sans-serif' },
  toast: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    backgroundColor: '#1b5e20',
    color: '#fff',
    padding: '0.9rem 1.4rem',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 9999,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#1b5e20',
    color: '#ffffff',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  brandGroup: { display: 'flex', alignItems: 'center', gap: '1rem' },
  logoIcon: { fontSize: '2.4rem' },
  brandTitle: { margin: 0, fontSize: '1.4rem', fontWeight: 'bold' },
  brandSubtitle: { margin: 0, fontSize: '0.82rem', color: '#c8e6c9' },
  roleGroup: { display: 'flex', alignItems: 'center', gap: '0.6rem' },
  roleLabel: { fontSize: '0.88rem', color: '#e8f5e9' },
  roleSelect: {
    padding: '0.5rem 0.8rem',
    borderRadius: '6px',
    border: 'none',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    backgroundColor: '#ffffff',
    color: '#1b5e20',
    cursor: 'pointer',
  },
  tabNav: {
    display: 'flex',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e0e0e0',
    padding: '0 2rem',
    gap: '0.8rem',
    overflowX: 'auto',
  },
  tabBtn: {
    padding: '0.9rem 0.8rem',
    border: 'none',
    background: 'none',
    fontSize: '0.95rem',
    cursor: 'pointer',
    color: '#666',
    borderBottom: '3px solid transparent',
    whiteSpace: 'nowrap',
  },
  tabBtnActive: {
    padding: '0.9rem 0.8rem',
    border: 'none',
    background: 'none',
    fontSize: '0.95rem',
    cursor: 'pointer',
    color: '#1b5e20',
    fontWeight: 'bold',
    borderBottom: '3px solid #1b5e20',
    whiteSpace: 'nowrap',
  },
  content: { padding: '2rem', maxWidth: '1360px', margin: '0 auto' },
  sectionHeader: { margin: '0 0 0.4rem 0', color: '#212121', fontSize: '1.3rem' },
  subtext: { margin: '0 0 1.5rem 0', color: '#666', fontSize: '0.9rem' },
  actionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' },
  primaryBtn: {
    backgroundColor: '#2e7d32',
    color: '#ffffff',
    padding: '0.65rem 1.2rem',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  secondaryBtn: {
    backgroundColor: '#eceff1',
    color: '#37474f',
    padding: '0.55rem 1rem',
    border: '1px solid #cfd8dc',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  cancelBtn: {
    padding: '0.65rem 1.2rem',
    border: '1px solid #ccc',
    borderRadius: '6px',
    background: '#f5f5f5',
    color: '#333',
    cursor: 'pointer',
    fontWeight: '600',
  },
  searchInput: {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
    marginBottom: '1.5rem',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
    backgroundColor: '#fff',
    color: '#111',
  },
  mandiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' },
  mandiCard: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '1.2rem',
    border: '1px solid #e0e0e0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cropTitle: { fontWeight: 'bold', fontSize: '1.05rem' },
  trendUp: { color: '#2e7d32', backgroundColor: '#e8f5e9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' },
  trendDown: { color: '#c62828', backgroundColor: '#ffebee', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' },
  mandiSub: { color: '#757575', fontSize: '0.82rem', margin: '0.5rem 0' },
  mandiPrice: { fontSize: '1.3rem', fontWeight: 'bold', color: '#1b5e20', margin: '0.4rem 0 0 0' },
  unit: { fontSize: '0.8rem', color: '#757575', fontWeight: 'normal' },
  lotGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.3rem' },
  lotCard: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '1.2rem',
    border: '1px solid #e0e0e0',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
  },
  lotTitle: { margin: '0 0 0.4rem 0', fontSize: '1.15rem', color: '#1b5e20' },
  gradeBadge: { backgroundColor: '#e8f5e9', color: '#1b5e20', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' },
  lotMeta: { color: '#555', fontSize: '0.88rem', margin: '0 0 0.4rem 0' },
  lotQuantity: { color: '#444', fontSize: '0.9rem', fontWeight: '500', margin: '0 0 0.8rem 0' },
  bidBox: {
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: '#f9fbe7',
    padding: '0.75rem',
    borderRadius: '6px',
    marginBottom: '1rem',
  },
  label: { display: 'block', fontSize: '0.72rem', color: '#757575' },
  baseVal: { fontWeight: 'bold', color: '#333' },
  topVal: { fontWeight: 'bold', color: '#2e7d32', fontSize: '1.05rem' },
  storePrice: { fontSize: '1.25rem', fontWeight: 'bold', color: '#1b5e20', margin: '0.5rem 0 1rem 0' },
  bidBtn: {
    backgroundColor: '#1b5e20',
    color: '#ffffff',
    padding: '0.65rem',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%',
  },
  scannerWrapper: { maxWidth: '720px', margin: '0 auto' },
  scanTypeRow: { display: 'flex', gap: '0.8rem', marginBottom: '1.2rem' },
  typeBtn: {
    flex: 1,
    padding: '0.75rem',
    border: '1px solid #ccc',
    backgroundColor: '#fff',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    color: '#555',
  },
  typeBtnActive: {
    flex: 1,
    padding: '0.75rem',
    border: '2px solid #1b5e20',
    backgroundColor: '#e8f5e9',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    color: '#1b5e20',
  },
  cameraBox: {
    backgroundColor: '#ffffff',
    border: '2px dashed #cfd8dc',
    borderRadius: '12px',
    padding: '1.5rem',
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  cameraPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.8rem',
    padding: '2rem 0',
  },
  cameraControls: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginTop: '1rem',
  },
  captureCircleBtn: {
    backgroundColor: '#1b5e20',
    color: '#ffffff',
    padding: '0.7rem 1.4rem',
    border: 'none',
    borderRadius: '30px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
  },
  loadingText: { textAlign: 'center', color: '#1b5e20', fontWeight: 'bold' },
  diagCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #c8e6c9',
    borderRadius: '10px',
    padding: '1.4rem',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
  },
  diagHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  diagTag: { backgroundColor: '#e8f5e9', color: '#1b5e20', fontSize: '0.75rem', fontWeight: 'bold', padding: '0.2rem 0.5rem', borderRadius: '4px' },
  severityBadge: { backgroundColor: '#ffebee', color: '#c62828', fontSize: '0.75rem', fontWeight: 'bold', padding: '0.2rem 0.5rem', borderRadius: '4px' },
  remedyBox: { backgroundColor: '#f1f8e9', padding: '0.9rem', borderRadius: '8px', marginTop: '0.8rem', fontSize: '0.9rem', color: '#2e7d32' },
  weatherSummaryCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    padding: '1.8rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1.5rem',
    boxShadow: '0 3px 6px rgba(0,0,0,0.04)',
  },
  weatherBadge: { backgroundColor: '#e3f2fd', color: '#0d47a1', fontSize: '0.82rem', padding: '0.3rem 0.6rem', borderRadius: '4px', fontWeight: '600' },
  weatherTemp: { fontSize: '3.2rem', margin: '0.4rem 0 0.1rem 0', color: '#1b5e20' },
  weatherDesc: { color: '#616161', fontSize: '1rem', margin: 0 },
  weatherMeta: { fontSize: '0.95rem', lineHeight: '1.8', maxWidth: '420px' },
  timelineGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' },
  timelineCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '1rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
  },
  timelineTime: { fontWeight: 'bold', color: '#1b5e20', fontSize: '0.95rem', marginBottom: '0.4rem' },
  timelineStatus: { color: '#0d47a1', fontWeight: '600', fontSize: '0.88rem', marginBottom: '0.3rem' },
  timelineAdvisory: { color: '#666', fontSize: '0.82rem' },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#ffffff',
    padding: '2rem',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '440px',
    color: '#212121',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
  },
  formLabel: { display: 'block', fontSize: '0.88rem', fontWeight: 'bold', color: '#333', margin: '0.8rem 0 0.3rem 0' },
  formInput: {
    width: '100%',
    padding: '0.65rem',
    borderRadius: '6px',
    border: '1px solid #bbb',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
    color: '#111111',
    fontSize: '0.95rem',
  },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1.4rem' },
};