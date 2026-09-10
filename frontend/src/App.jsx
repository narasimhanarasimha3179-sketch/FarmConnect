import React, { useState, useEffect, useMemo, useRef } from 'react';
import BuyerTradingFloor from './components/BuyerTradingFloor';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const getRegisteredUsers = () => {
    try {
      const data = localStorage.getItem('fc_registered_users');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  // Authentication & Session (No prefilling)
  const [authView, setAuthView] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);

  // Sign-Up Form State
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState('farmer');

  // Login Form State (Clean and empty)
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Dashboard Navigation & Data States
  const [activeTab, setActiveTab] = useState('procurement');
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Mandi Live Rates State
  const [mandiRates, setMandiRates] = useState([]);
  const [mandiLoading, setMandiLoading] = useState(false);

  // Weather Live Telemetry State
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Modals & User Interaction
  const [showLotModal, setShowLotModal] = useState(false);
  const [bidModalItem, setBidModalItem] = useState(null);
  const [bidAmount, setBidAmount] = useState('');

  const [newLot, setNewLot] = useState({
    cropName: '',
    quantity: '',
    farmerName: '',
    location: 'Karnataka',
    pricePerQuintal: '',
  });

  // Camera & Diagnostics State
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
    setTimeout(() => setToastMessage(''), 4500);
  };

  // 1. Sign Up Handler (Saves to registry & opens session directly)
  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    const name = signupName.trim();
    const phone = signupPhone.trim();
    const password = signupPassword.trim();

    if (!name || !phone || !password) {
      showToast('⚠️ All registration fields are required.');
      return;
    }
    if (phone.length < 10) {
      showToast('⚠️ Enter a valid 10-digit mobile number.');
      return;
    }

    const users = getRegisteredUsers();
    if (users.some((u) => u.phone === phone)) {
      showToast('⚠️ Mobile number already registered. Please sign in.');
      setAuthView('login');
      return;
    }

    const newUser = { name, phone, password, role: signupRole, createdAt: new Date().toISOString() };
    users.push(newUser);
    localStorage.setItem('fc_registered_users', JSON.stringify(users));

    setSignupName('');
    setSignupPhone('');
    setSignupPassword('');
    setLoginPhone('');
    setLoginPassword('');

    setCurrentUser(newUser);
    setNewLot((prev) => ({ ...prev, farmerName: newUser.name }));
    showToast(`🌾 Account created! Welcome to FarmConnect, ${name}!`);
  };

  // 2. Login Handler (Authenticates with zero pre-filled data)
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const phone = loginPhone.trim();
    const password = loginPassword.trim();

    const users = getRegisteredUsers();
    const matched = users.find((u) => u.phone === phone);

    if (!matched) {
      showToast('❌ Account not found. Please Sign Up first.');
      setAuthView('signup');
      return;
    }
    if (matched.password !== password) {
      showToast('❌ Incorrect password. Please try again.');
      return;
    }

    setCurrentUser(matched);
    setNewLot((prev) => ({ ...prev, farmerName: matched.name }));
    showToast(`🌾 Welcome back, ${matched.name}!`);
  };

  // 3. Logout Handler (Resets session and clears inputs completely)
  const handleLogout = () => {
    stopCamera();
    setCurrentUser(null);
    setAuthView('login');
    setLoginPhone('');
    setLoginPassword('');
    showToast('👋 You have been logged out.');
  };

  function getRoleTitle(role) {
    switch (role) {
      case 'farmer': return '🌾 Farmer (Producer)';
      case 'buyer': return '💼 APMC Buyer / Trader';
      case 'agri_seller': return '🛍️ Agri Supplies Dealer';
      case 'expert': return '🔬 Agri Expert';
      default: return role;
    }
  }

  // Live Backend Fetchers
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const res = await fetch(`${API_BASE}/products`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Failed to load marketplace products:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchMandiRates = async () => {
    try {
      setMandiLoading(true);
      const res = await fetch(`${API_BASE}/mandi/rates`);
      const data = await res.json();
      if (data.success) {
        setMandiRates(data.rates || []);
      }
    } catch (err) {
      console.error('Failed to fetch Mandi benchmark rates:', err);
    } finally {
      setMandiLoading(false);
    }
  };

  const fetchLiveWeather = async (lat = 12.9716, lon = 77.5946) => {
    try {
      setWeatherLoading(true);
      const res = await fetch(`${API_BASE}/weather/live?lat=${lat}&lon=${lon}`);
      const result = await res.json();

      if (!result.success || !result.data) {
        throw new Error('Weather API unavailable');
      }

      const current = result.data.current;
      const hourly = result.data.hourly;
      const currentHour = new Date().getHours();

      const timeline = [];
      for (let i = currentHour; i < currentHour + 6 && i < hourly.time.length; i++) {
        const timeStr = hourly.time[i].split('T')[1];
        const prob = hourly.precipitation_probability[i];
        let advisory = 'Safe window for harvest and spraying';
        if (prob >= 60) advisory = '⚠️ Rain expected! Secure open produce and stop spraying';
        else if (prob >= 30) advisory = 'Overcast; delay pesticide application';

        timeline.push({
          time: timeStr,
          prob: `${prob}%`,
          temp: `${hourly.temperature_2m[i]}°C`,
          advisory,
        });
      }

      setWeatherData({
        location: `Region Coordinates: ${Number(lat).toFixed(2)}°N, ${Number(lon).toFixed(2)}°E`,
        temp: `${current.temperature_2m}°C`,
        humidity: `${current.relative_humidity_2m}%`,
        rainProb: `${hourly.precipitation_probability[currentHour] || 0}%`,
        condition: current.weather_code > 50 ? 'Precipitation / Showers' : 'Partly Cloudy / Clear',
        timeline,
      });
    } catch (err) {
      console.error('Failed to fetch live weather telemetry:', err);
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchProducts();
      fetchMandiRates();

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => fetchLiveWeather(pos.coords.latitude, pos.coords.longitude),
          () => fetchLiveWeather()
        );
      } else {
        fetchLiveWeather();
      }
    }
  }, [currentUser]);

  // Camera Operations
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
      showToast('Camera permission denied or camera device missing.');
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

    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append('leafImage', blob, 'sample.jpg');
      formData.append('scanType', scanType);

      try {
        setAnalyzing(true);
        const res = await fetch(`${API_BASE}/ai/diagnose`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success) {
          setScanResult(data.diagnosis);
          showToast(`Diagnostic scan complete for ${scanType.toUpperCase()}`);
        } else {
          showToast(data.error || 'Diagnostic evaluation failed.');
        }
      } catch (err) {
        showToast('Backend diagnostic server is unreachable.');
      } finally {
        setAnalyzing(false);
      }
    }, 'image/jpeg');
  };

  // Marketplace Actions
  const handleCreateLot = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newLot,
        farmerName: currentUser ? currentUser.name : 'Registered Producer',
      };
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setShowLotModal(false);
        setNewLot({ cropName: '', quantity: '', farmerName: currentUser?.name || '', location: 'Karnataka', pricePerQuintal: '' });
        fetchProducts();
        showToast('Harvest lot registered successfully on the live exchange!');
      } else {
        showToast(data.error || 'Failed to submit harvest lot.');
      }
    } catch (err) {
      showToast('Network error while posting lot.');
    }
  };

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!bidModalItem || !bidAmount) return;

    try {
      const res = await fetch(`${API_BASE}/products/${bidModalItem._id}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerName: currentUser.name,
          bidAmount: Number(bidAmount),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBidModalItem(null);
        setBidAmount('');
        fetchProducts();
        showToast(`Counter-bid of ₹${bidAmount}/Qtl registered on lot!`);
      } else {
        showToast(data.error || 'Bid rejected.');
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

  // VIEW 1: AUTHENTICATION (SIGN UP & LOGIN)
  if (!currentUser) {
    return (
      <div style={styles.authContainer}>
        {toastMessage && <div style={styles.toast}>{toastMessage}</div>}

        <div style={styles.authCard}>
          <div style={styles.authBrand}>
            <span style={styles.brandIcon}>🌱</span>
            <h1 style={styles.brandName}>FarmConnect</h1>
            <p style={styles.brandTagline}>Agricultural Marketplace & Mandi Exchange</p>
          </div>

          <div style={styles.navToggleRow}>
            <button
              type="button"
              style={authView === 'login' ? styles.navToggleBtnActive : styles.navToggleBtn}
              onClick={() => {
                setAuthView('login');
                setLoginPhone('');
                setLoginPassword('');
              }}
            >
              Sign In (Login)
            </button>
            <button
              type="button"
              style={authView === 'signup' ? styles.navToggleBtnActive : styles.navToggleBtn}
              onClick={() => setAuthView('signup')}
            >
              Create Account (Sign Up)
            </button>
          </div>

          {authView === 'login' && (
            <form onSubmit={handleLoginSubmit} style={styles.formElement}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Mobile Number *</label>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  placeholder="Enter 10-digit number"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, ''))}
                  style={styles.inputField}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={styles.inputField}
                />
              </div>

              <button type="submit" style={styles.authSubmitBtn}>
                Sign In to Portal →
              </button>

              <p style={styles.switchPrompt}>
                First time here?{' '}
                <span style={styles.switchLink} onClick={() => setAuthView('signup')}>
                  Create an account now
                </span>
              </p>
            </form>
          )}

          {authView === 'signup' && (
            <form onSubmit={handleSignUpSubmit} style={styles.formElement}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name / Farm Enterprise Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Gowda"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  style={styles.inputField}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>10-Digit Mobile Number *</label>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  placeholder="e.g. 9845012345"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, ''))}
                  style={styles.inputField}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Set Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Choose a password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  style={styles.inputField}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Operating Role *</label>
                <select
                  value={signupRole}
                  onChange={(e) => setSignupRole(e.target.value)}
                  style={styles.selectField}
                >
                  <option value="farmer">🌾 Farmer (Produce Seller)</option>
                  <option value="buyer">💼 APMC Buyer / Institutional Trader</option>
                  <option value="agri_seller">🛍️ Agri Inputs Dealer</option>
                  <option value="expert">🔬 Agronomist & Crop Specialist</option>
                </select>
              </div>

              <button type="submit" style={styles.authSubmitBtn}>
                Register & Enter Portal Directly →
              </button>

              <p style={styles.switchPrompt}>
                Already have an account?{' '}
                <span style={styles.switchLink} onClick={() => setAuthView('login')}>
                  Sign In instead
                </span>
              </p>
            </form>
          )}

          <div style={styles.footerNote}>
            🔒 Connected to APMC e-Procurement Protocols & Verified Trade Gateways
          </div>
        </div>
      </div>
    );
  }

  // VIEW 2: LOGGED-IN PORTAL
  return (
    <div style={styles.appContainer}>
      {toastMessage && <div style={styles.toast}>{toastMessage}</div>}

      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <span style={{ fontSize: '2.4rem' }}>🌱</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem' }}>FarmConnect Portal</h1>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#c8e6c9' }}>
              Mandi Intelligence • B2B Procurement • AI Pathology & Soil
            </p>
          </div>
        </div>

        <div style={styles.userProfileArea}>
          <div style={styles.userBadge}>
            <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{currentUser.name}</div>
            <div style={{ fontSize: '0.8rem', color: '#c8e6c9' }}>
              {getRoleTitle(currentUser.role)} • 📞 +91 {currentUser.phone}
            </div>
          </div>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </header>

      <nav style={styles.tabNav}>
        <button
          style={activeTab === 'procurement' ? styles.tabBtnActive : styles.tabBtn}
          onClick={() => { stopCamera(); setActiveTab('procurement'); }}
        >
          💼 B2B Institutional Procurement
        </button>

        <button
          style={activeTab === 'mandi' ? styles.tabBtnActive : styles.tabBtn}
          onClick={() => { stopCamera(); setActiveTab('mandi'); }}
        >
          📊 Mandi Intelligence
        </button>

        <button
          style={activeTab === 'marketplace' ? styles.tabBtnActive : styles.tabBtn}
          onClick={() => { stopCamera(); setActiveTab('marketplace'); }}
        >
          🌾 Live Marketplace ({products.length})
        </button>

        <button
          style={activeTab === 'scanner' ? styles.tabBtnActive : styles.tabBtn}
          onClick={() => setActiveTab('scanner')}
        >
          📷 AI Foliage & Soil Scanner
        </button>

        <button
          style={activeTab === 'weather' ? styles.tabBtnActive : styles.tabBtn}
          onClick={() => { stopCamera(); setActiveTab('weather'); }}
        >
          🌧️ Rain Forecast
        </button>
      </nav>

      <main style={styles.content}>
        {activeTab === 'procurement' && <BuyerTradingFloor />}

        {activeTab === 'mandi' && (
          <div>
            <h2 style={styles.sectionHeader}>📊 Real-time APMC Mandi Benchmark Rates</h2>
            <p style={styles.subtext}>Live district market auction indices streamed from backend proxy</p>
            {mandiLoading ? (
              <p>Fetching latest APMC indices...</p>
            ) : (
              <div style={styles.mandiGrid}>
                {mandiRates.map((m) => (
                  <div key={m.id} style={styles.mandiCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <b>{m.emoji} {m.crop}</b>
                      <span style={m.up ? styles.trendUp : styles.trendDown}>{m.change}</span>
                    </div>
                    <p style={{ color: '#666', fontSize: '0.85rem' }}>{m.mandi} • {m.state}</p>
                    <h3 style={{ color: '#1b5e20', margin: '0.4rem 0' }}>{m.price} / Qtl</h3>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'marketplace' && (
          <div>
            <div style={styles.actionHeader}>
              <div>
                <h2 style={styles.sectionHeader}>🌾 Live Harvest Lots (Direct from Farmers)</h2>
                <p style={styles.subtext}>Inspect quality grades, moisture, and place transparent counter-bids</p>
              </div>
              {currentUser.role === 'farmer' && (
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
              {productsLoading ? (
                <p>Loading active harvest listings...</p>
              ) : filteredProducts.length === 0 ? (
                <p>No listings found matching your search.</p>
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
                        {currentUser.role === 'buyer' ? 'Place Higher Bid' : 'Inspect Bids'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'scanner' && (
          <div style={styles.scannerWrapper}>
            <h2 style={styles.sectionHeader}>📷 AI Crop Foliage & Soil Health Camera</h2>
            <p style={styles.subtext}>Diagnose plant leaf infections or inspect soil fertility condition</p>

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
                  <p style={{ fontWeight: '600', color: '#444' }}>Camera Viewfinder Inactive</p>
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

        {activeTab === 'weather' && (
          <div>
            <h2 style={styles.sectionHeader}>🌧️ Real-time Rain Forecasting & Agro-Advisory</h2>
            <p style={styles.subtext}>Know when rain will arrive before harvesting, irrigation, or fertilizer application</p>

            {weatherLoading ? (
              <p>Fetching real-time satellite radar telemetry...</p>
            ) : weatherData ? (
              <div>
                <div style={styles.weatherSummaryCard}>
                  <div>
                    <span style={styles.weatherBadge}>{weatherData.location}</span>
                    <h1 style={styles.weatherTemp}>{weatherData.temp}</h1>
                    <p style={styles.weatherDesc}>☁️ {weatherData.condition}</p>
                  </div>
                  <div style={styles.weatherMeta}>
                    <p>💧 <b>Relative Humidity:</b> {weatherData.humidity}</p>
                    <p>☔ <b>Current Rain Probability:</b> <b style={{ color: '#d32f2f' }}>{weatherData.rainProb}</b></p>
                    <p>🛰️ <b>Data Source:</b> Live Open-Meteo Satellite Model via Node Proxy</p>
                  </div>
                </div>

                <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>⏱️ Hourly Rain Arrival Timeline</h3>
                <div style={styles.timelineGrid}>
                  {weatherData.timeline.map((slot, idx) => (
                    <div key={idx} style={styles.timelineCard}>
                      <div style={styles.timelineTime}>{slot.time}</div>
                      <div style={styles.timelineStatus}>Rain Probability: {slot.prob}</div>
                      <div style={{ fontSize: '0.85rem', color: '#444' }}>Temp: {slot.temp}</div>
                      <div style={styles.timelineAdvisory}>{slot.advisory}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p>Weather data unavailable.</p>
            )}
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
              <label style={styles.formLabel}>Buyer Entity:</label>
              <input style={styles.formInput} disabled value={currentUser.name} />

              <label style={styles.formLabel}>Your Bid Rate (₹ per Quintal):</label>
              <input
                type="number"
                style={styles.formInput}
                required
                placeholder="Must be higher than current rate"
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
  authContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#133918',
    backgroundImage: 'linear-gradient(135deg, #1b5e20 0%, #0d2810 100%)',
    padding: '2rem 1rem',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    boxSizing: 'border-box',
  },
  authCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '2.4rem 2.2rem',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 20px 45px rgba(0,0,0,0.3)',
    boxSizing: 'border-box',
  },
  authBrand: { textAlign: 'center', marginBottom: '1.4rem' },
  brandIcon: { fontSize: '2.5rem', display: 'inline-block', marginBottom: '0.2rem' },
  brandName: { margin: '0 0 0.2rem 0', color: '#1b5e20', fontSize: '1.8rem', fontWeight: '800' },
  brandTagline: { margin: 0, color: '#666', fontSize: '0.86rem' },

  navToggleRow: {
    display: 'flex',
    gap: '0.4rem',
    backgroundColor: '#f0f4f1',
    padding: '0.3rem',
    borderRadius: '8px',
    marginBottom: '1.4rem',
  },
  navToggleBtn: {
    flex: 1,
    padding: '0.6rem 0.2rem',
    border: 'none',
    background: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.84rem',
    fontWeight: '600',
    color: '#666',
  },
  navToggleBtnActive: {
    flex: 1,
    padding: '0.6rem 0.2rem',
    border: 'none',
    backgroundColor: '#ffffff',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.84rem',
    fontWeight: '700',
    color: '#1b5e20',
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
  },

  formElement: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '0.35rem', textAlign: 'left' },
  label: { fontSize: '0.82rem', fontWeight: '700', color: '#222222' },
  inputField: {
    width: '100%',
    padding: '0.75rem 0.9rem',
    borderRadius: '8px',
    border: '1.5px solid #c2c9cf',
    backgroundColor: '#ffffff',
    color: '#111111',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
    outline: 'none',
  },
  selectField: {
    width: '100%',
    padding: '0.75rem 0.9rem',
    borderRadius: '8px',
    border: '1.5px solid #c2c9cf',
    backgroundColor: '#ffffff',
    color: '#111111',
    fontSize: '0.92rem',
    fontWeight: '600',
    boxSizing: 'border-box',
    cursor: 'pointer',
  },
  authSubmitBtn: {
    backgroundColor: '#1b5e20',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.9rem',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(27,94,32,0.25)',
    marginTop: '0.3rem',
  },
  switchPrompt: {
    textAlign: 'center',
    margin: '0.6rem 0 0 0',
    fontSize: '0.82rem',
    color: '#666',
  },
  switchLink: {
    color: '#1b5e20',
    fontWeight: '700',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  footerNote: {
    textAlign: 'center',
    marginTop: '1.6rem',
    fontSize: '0.74rem',
    color: '#888',
  },

  appContainer: { minHeight: '100vh', backgroundColor: '#f4f6f8', fontFamily: 'system-ui, sans-serif' },
  toast: { position: 'fixed', top: '20px', right: '20px', backgroundColor: '#1b5e20', color: '#fff', padding: '0.9rem 1.4rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 9999, fontWeight: 'bold' },
  header: { backgroundColor: '#1b5e20', color: '#ffffff', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' },
  userProfileArea: { display: 'flex', alignItems: 'center', gap: '1rem' },
  userBadge: { textAlign: 'right' },
  logoutBtn: { backgroundColor: '#c62828', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' },
  tabNav: { display: 'flex', backgroundColor: '#ffffff', borderBottom: '1px solid #e0e0e0', padding: '0 2rem', gap: '0.8rem', overflowX: 'auto' },
  tabBtn: { padding: '0.9rem 0.8rem', border: 'none', background: 'none', fontSize: '0.95rem', cursor: 'pointer', color: '#666', borderBottom: '3px solid transparent', whiteSpace: 'nowrap' },
  tabBtnActive: { padding: '0.9rem 0.8rem', border: 'none', background: 'none', fontSize: '0.95rem', cursor: 'pointer', color: '#1b5e20', fontWeight: 'bold', borderBottom: '3px solid #1b5e20', whiteSpace: 'nowrap' },
  content: { padding: '2rem', maxWidth: '1360px', margin: '0 auto' },
  sectionHeader: { margin: '0 0 0.4rem 0', color: '#212121', fontSize: '1.3rem' },
  subtext: { margin: '0 0 1.5rem 0', color: '#666', fontSize: '0.9rem' },
  actionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' },
  primaryBtn: { backgroundColor: '#2e7d32', color: '#ffffff', padding: '0.65rem 1.2rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  secondaryBtn: { backgroundColor: '#eceff1', color: '#37474f', padding: '0.55rem 1rem', border: '1px solid #cfd8dc', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
  cancelBtn: { padding: '0.65rem 1.2rem', border: '1px solid #ccc', borderRadius: '6px', background: '#f5f5f5', color: '#333', cursor: 'pointer', fontWeight: '600' },
  searchInput: { width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '1.5rem', fontSize: '0.95rem', boxSizing: 'border-box', backgroundColor: '#fff', color: '#111' },
  mandiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' },
  mandiCard: { backgroundColor: '#ffffff', borderRadius: '10px', padding: '1.2rem', border: '1px solid #e0e0e0', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' },
  trendUp: { color: '#2e7d32', backgroundColor: '#e8f5e9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' },
  trendDown: { color: '#c62828', backgroundColor: '#ffebee', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' },
  lotGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.3rem' },
  lotCard: { backgroundColor: '#ffffff', borderRadius: '10px', padding: '1.2rem', border: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  lotTitle: { margin: '0 0 0.4rem 0', fontSize: '1.15rem', color: '#1b5e20' },
  gradeBadge: { backgroundColor: '#e8f5e9', color: '#1b5e20', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' },
  lotMeta: { color: '#555', fontSize: '0.88rem', margin: '0 0 0.4rem 0' },
  lotQuantity: { color: '#444', fontSize: '0.9rem', fontWeight: '500', margin: '0 0 0.8rem 0' },
  bidBox: { display: 'flex', justifyContent: 'space-between', backgroundColor: '#f9fbe7', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' },
  baseVal: { fontWeight: 'bold', color: '#333' },
  topVal: { fontWeight: 'bold', color: '#2e7d32', fontSize: '1.05rem' },
  bidBtn: { backgroundColor: '#1b5e20', color: '#ffffff', padding: '0.65rem', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', width: '100%' },
  scannerWrapper: { maxWidth: '720px', margin: '0 auto' },
  scanTypeRow: { display: 'flex', gap: '0.8rem', marginBottom: '1.2rem' },
  typeBtn: { flex: 1, padding: '0.75rem', border: '1px solid #ccc', backgroundColor: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#555' },
  typeBtnActive: { flex: 1, padding: '0.75rem', border: '2px solid #1b5e20', backgroundColor: '#e8f5e9', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#1b5e20' },
  cameraBox: { backgroundColor: '#ffffff', border: '2px dashed #cfd8dc', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', marginBottom: '1.5rem' },
  cameraPlaceholder: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', padding: '2rem 0' },
  cameraControls: { display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' },
  captureCircleBtn: { backgroundColor: '#1b5e20', color: '#ffffff', padding: '0.7rem 1.4rem', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' },
  loadingText: { textAlign: 'center', color: '#1b5e20', fontWeight: 'bold' },
  diagCard: { backgroundColor: '#ffffff', border: '1px solid #c8e6c9', borderRadius: '10px', padding: '1.4rem' },
  diagHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  diagTag: { backgroundColor: '#e8f5e9', color: '#1b5e20', fontSize: '0.75rem', fontWeight: 'bold', padding: '0.2rem 0.5rem', borderRadius: '4px' },
  severityBadge: { backgroundColor: '#ffebee', color: '#c62828', fontSize: '0.75rem', fontWeight: 'bold', padding: '0.2rem 0.5rem', borderRadius: '4px' },
  remedyBox: { backgroundColor: '#f1f8e9', padding: '0.9rem', borderRadius: '8px', marginTop: '0.8rem', fontSize: '0.9rem', color: '#2e7d32' },
  weatherSummaryCard: { backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '1.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' },
  weatherBadge: { backgroundColor: '#e3f2fd', color: '#0d47a1', fontSize: '0.82rem', padding: '0.3rem 0.6rem', borderRadius: '4px', fontWeight: '600' },
  weatherTemp: { fontSize: '3.2rem', margin: '0.4rem 0 0.1rem 0', color: '#1b5e20' },
  weatherDesc: { color: '#616161', fontSize: '1rem', margin: 0 },
  weatherMeta: { fontSize: '0.95rem', lineHeight: '1.8', maxWidth: '420px' },
  timelineGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' },
  timelineCard: { backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem' },
  timelineTime: { fontWeight: 'bold', color: '#1b5e20', fontSize: '0.95rem', marginBottom: '0.4rem' },
  timelineStatus: { color: '#0d47a1', fontWeight: '600', fontSize: '0.88rem', marginBottom: '0.3rem' },
  timelineAdvisory: { color: '#666', fontSize: '0.82rem' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#ffffff', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '440px', color: '#212121' },
  formLabel: { display: 'block', fontSize: '0.88rem', fontWeight: 'bold', color: '#333', margin: '0.8rem 0 0.3rem 0' },
  formInput: { width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #bbb', boxSizing: 'border-box', backgroundColor: '#ffffff', color: '#111111', fontSize: '0.95rem' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1.4rem' },
};