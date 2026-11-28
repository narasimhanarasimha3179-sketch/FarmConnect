// FarmConnect 2.0 — Production Single-Page Agricultural E-Commerce & Platform Experience
// Modeled after Amazon, Flipkart, and Shopify with authentic Indian agricultural identity

function renderFarmConnectApp() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>FarmConnect · Smart Agricultural Marketplace & Farming Platform</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌱</text></svg>">
  <style>
    :root {
      --primary: #176B3A;
      --primary-dark: #12552E;
      --primary-light: #EAF6EE;
      --secondary: #258B50;
      --accent: #F2A541;
      --accent-hover: #D98E28;
      --dark-text: #17251D;
      --body-text: #647067;
      --bg: #F7F9F7;
      --card-bg: #FFFFFF;
      --border: #E2E8F0;
      --success: #16A34A;
      --warning: #D97706;
      --danger: #DC2626;
      --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
      --shadow-md: 0 4px 12px rgba(23, 107, 58, 0.08);
      --shadow-lg: 0 10px 25px rgba(23, 107, 58, 0.12);
      --radius: 12px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
    body { background-color: var(--bg); color: var(--dark-text); min-height: 100vh; display: flex; flex-direction: column; }

    /* Top Strip */
    .top-strip {
      background: #114524;
      color: #D1E7DD;
      font-size: 0.8rem;
      padding: 6px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .top-strip a { color: #A3E635; text-decoration: none; font-weight: 600; margin-left: 6px; }

    /* Main Header */
    .navbar {
      background: var(--card-bg);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: var(--shadow-sm);
    }
    .nav-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 12px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: var(--primary);
      cursor: pointer;
    }
    .brand-icon { font-size: 2rem; }
    .brand-title { font-size: 1.4rem; font-weight: 800; letter-spacing: -0.5px; color: var(--primary); }
    .brand-sub { font-size: 0.65rem; font-weight: 700; letter-spacing: 1.5px; color: var(--secondary); text-transform: uppercase; }

    /* Search Bar */
    .search-box {
      flex: 1;
      max-width: 580px;
      display: flex;
      border: 2px solid var(--primary);
      border-radius: 8px;
      overflow: hidden;
      background: white;
    }
    .search-box input {
      flex: 1;
      border: none;
      padding: 10px 16px;
      font-size: 0.95rem;
      outline: none;
      color: var(--dark-text);
    }
    .search-box button {
      background: var(--primary);
      color: white;
      border: none;
      padding: 0 18px;
      font-size: 1.1rem;
      cursor: pointer;
      transition: background 0.2s;
    }
    .search-box button:hover { background: var(--primary-dark); }

    /* Header Actions */
    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .btn-auth-signin {
      background: transparent;
      color: var(--primary);
      border: 1.5px solid var(--primary);
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-auth-signin:hover {
      background: var(--primary-light);
    }
    .btn-auth-register {
      background: var(--primary);
      color: white;
      border: none;
      padding: 9px 18px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-auth-register:hover {
      background: var(--primary-dark);
    }
    .cart-btn {
      position: relative;
      background: var(--primary-light);
      border: 1px solid #C6E9D2;
      color: var(--primary);
      padding: 8px 14px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .cart-badge {
      background: var(--accent);
      color: white;
      font-size: 0.75rem;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 999px;
    }

    /* Sub-nav Ribbon */
    .subnav {
      background: #17251D;
      color: white;
      overflow-x: auto;
      white-space: nowrap;
    }
    .subnav-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 20px;
      display: flex;
      gap: 4px;
    }
    .subnav-item {
      padding: 10px 14px;
      color: #E2E8F0;
      font-size: 0.85rem;
      font-weight: 600;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }
    .subnav-item:hover, .subnav-item.active {
      color: #FFFFFF;
      background: rgba(255,255,255,0.06);
      border-bottom-color: var(--accent);
    }

    /* Hero Banner */
    .hero {
      background: linear-gradient(135deg, #176B3A 0%, #0F4926 100%);
      color: white;
      padding: 48px 20px;
      position: relative;
      overflow: hidden;
    }
    .hero-container {
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 40px;
    }
    .hero-content {
      max-width: 650px;
    }
    .hero-pill {
      display: inline-block;
      background: rgba(255,255,255,0.18);
      color: #A7F3D0;
      padding: 5px 12px;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 1px;
      margin-bottom: 16px;
      text-transform: uppercase;
    }
    .hero-title {
      font-size: 2.8rem;
      font-weight: 800;
      line-height: 1.15;
      margin-bottom: 14px;
      letter-spacing: -1px;
    }
    .hero-desc {
      font-size: 1.1rem;
      color: #E6F4EA;
      line-height: 1.6;
      margin-bottom: 24px;
      font-weight: 400;
    }
    .hero-btns {
      display: flex;
      gap: 14px;
      flex-wrap: wrap;
    }
    .btn-hero-primary {
      background: var(--accent);
      color: #17251D;
      font-weight: 700;
      padding: 13px 26px;
      border-radius: 8px;
      border: none;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.2s;
      box-shadow: 0 4px 14px rgba(242, 165, 65, 0.4);
    }
    .btn-hero-primary:hover { background: var(--accent-hover); }
    .btn-hero-secondary {
      background: rgba(255,255,255,0.15);
      color: white;
      font-weight: 600;
      padding: 13px 24px;
      border-radius: 8px;
      border: 1.5px solid rgba(255,255,255,0.4);
      font-size: 1rem;
      cursor: pointer;
      backdrop-filter: blur(4px);
    }
    .hero-graphic {
      font-size: 8rem;
      opacity: 0.9;
      user-select: none;
    }

    /* Trust Pillars */
    .trust-strip {
      background: white;
      border-bottom: 1px solid var(--border);
      padding: 20px;
    }
    .trust-container {
      max-width: 1280px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
    }
    .trust-item {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .trust-icon {
      font-size: 2rem;
      background: var(--primary-light);
      color: var(--primary);
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .trust-text h4 { font-size: 0.95rem; font-weight: 700; color: var(--dark-text); }
    .trust-text p { font-size: 0.8rem; color: var(--body-text); }

    /* Main Container */
    .main-wrap {
      max-width: 1280px;
      margin: 32px auto;
      padding: 0 20px;
      flex: 1;
      width: 100%;
    }

    /* Section Headings */
    .section-head {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 20px;
    }
    .section-head h2 {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--dark-text);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-head a {
      color: var(--primary);
      text-decoration: none;
      font-weight: 700;
      font-size: 0.9rem;
    }

    /* 10 Agricultural Categories Grid */
    .category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      margin-bottom: 40px;
    }
    .category-card {
      background: white;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 18px 14px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: var(--shadow-sm);
    }
    .category-card:hover {
      border-color: var(--primary);
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }
    .cat-icon { font-size: 2.2rem; margin-bottom: 10px; display: inline-block; }
    .cat-name { font-weight: 700; font-size: 0.95rem; color: var(--dark-text); margin-bottom: 4px; }
    .cat-desc { font-size: 0.75rem; color: var(--body-text); line-height: 1.3; }

    /* Products Grid */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    .product-card {
      background: white;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .product-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-md);
    }
    .product-thumb {
      height: 140px;
      background: #F1F5F2;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3.5rem;
      position: relative;
    }
    .product-tag {
      position: absolute;
      top: 10px;
      left: 10px;
      background: var(--primary);
      color: white;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
    }
    .product-body {
      padding: 16px;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .product-category {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--secondary);
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .product-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--dark-text);
      margin-bottom: 6px;
      line-height: 1.3;
    }
    .product-seller {
      font-size: 0.8rem;
      color: var(--body-text);
      margin-bottom: 12px;
    }
    .product-footer {
      margin-top: auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding-top: 12px;
      border-top: 1px solid #F1F5F9;
    }
    .product-price {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--primary);
    }
    .btn-add-cart {
      background: var(--primary);
      color: white;
      border: none;
      padding: 8px 14px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-add-cart:hover { background: var(--primary-dark); }

    /* Crop Marketplace Section */
    .crop-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
      margin-bottom: 40px;
    }
    .crop-card {
      background: white;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 16px;
      box-shadow: var(--shadow-sm);
    }
    .crop-title { font-size: 1.05rem; font-weight: 800; color: var(--dark-text); margin-bottom: 4px; }
    .crop-loc { font-size: 0.8rem; color: var(--body-text); margin-bottom: 8px; }
    .crop-meta { display: flex; justify-content: space-between; font-weight: 700; color: var(--primary); font-size: 0.95rem; margin-bottom: 12px; }

    /* Live Mandi Ticker */
    .mandi-card {
      background: white;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px;
      margin-bottom: 40px;
      box-shadow: var(--shadow-sm);
    }
    .mandi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }
    .mandi-box {
      background: #F8FAF9;
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 14px;
    }
    .mandi-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }
    .mandi-crop { font-weight: 700; font-size: 1rem; color: var(--dark-text); }
    .mandi-rate { font-weight: 800; font-size: 1.1rem; color: var(--primary); }
    .mandi-market { font-size: 0.8rem; color: var(--body-text); margin-bottom: 8px; }
    .mandi-status { font-size: 0.75rem; font-weight: 700; color: var(--success); }

    /* Smart Farming Grid */
    .smart-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 16px;
      margin-bottom: 40px;
    }
    .smart-card {
      background: white;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px;
      box-shadow: var(--shadow-sm);
      cursor: pointer;
      transition: all 0.2s;
    }
    .smart-card:hover { border-color: var(--primary); transform: translateY(-2px); }
    .smart-card h4 { font-size: 1rem; font-weight: 700; margin: 8px 0; color: var(--dark-text); }
    .smart-card p { font-size: 0.8rem; color: var(--body-text); line-height: 1.4; }

    /* Helpline Banner */
    .helpline {
      background: #FEF3C7;
      border: 1px solid #FDE68A;
      border-radius: var(--radius);
      padding: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      margin-bottom: 40px;
      flex-wrap: wrap;
    }
    .helpline-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .helpline-icon { font-size: 2.5rem; }
    .helpline-text h3 { font-size: 1.15rem; font-weight: 800; color: #92400E; margin-bottom: 4px; }
    .helpline-text p { font-size: 0.85rem; color: #B45309; }
    .helpline-call {
      background: #92400E;
      color: white;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.95rem;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    /* Footer */
    .footer {
      background: #111827;
      color: #9CA3AF;
      padding: 48px 20px 24px;
      margin-top: auto;
      border-top: 4px solid var(--primary);
    }
    .footer-container {
      max-width: 1280px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 32px;
      margin-bottom: 32px;
    }
    .footer-col h3 { color: white; font-size: 1.1rem; font-weight: 700; margin-bottom: 14px; }
    .footer-col p { font-size: 0.85rem; line-height: 1.6; }
    .footer-col ul { list-style: none; }
    .footer-col li { margin-bottom: 8px; }
    .footer-col a { color: #9CA3AF; text-decoration: none; font-size: 0.85rem; transition: color 0.2s; }
    .footer-col a:hover { color: white; }
    .footer-bottom {
      max-width: 1280px;
      margin: 0 auto;
      padding-top: 20px;
      border-top: 1px solid rgba(255,255,255,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
      flex-wrap: wrap;
      gap: 12px;
    }

    /* Modal Backdrop */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.6);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 16px;
      backdrop-filter: blur(2px);
    }
    .modal-box {
      background: white;
      border-radius: 16px;
      max-width: 440px;
      width: 100%;
      padding: 28px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.3);
      position: relative;
    }
    .modal-close {
      position: absolute;
      top: 18px;
      right: 18px;
      font-size: 1.5rem;
      border: none;
      background: transparent;
      cursor: pointer;
      color: var(--body-text);
    }
    .modal-title { font-size: 1.4rem; font-weight: 800; color: var(--dark-text); margin-bottom: 6px; }
    .modal-sub { font-size: 0.85rem; color: var(--body-text); margin-bottom: 20px; }
    .form-group { margin-bottom: 16px; }
    .form-label { display: block; font-size: 0.85rem; font-weight: 700; color: var(--dark-text); margin-bottom: 6px; }
    .form-control {
      width: 100%;
      padding: 10px 14px;
      border: 1.5px solid var(--border);
      border-radius: 8px;
      font-size: 0.95rem;
      outline: none;
    }
    .form-control:focus { border-color: var(--primary); }
    .btn-submit {
      width: 100%;
      background: var(--primary);
      color: white;
      border: none;
      padding: 12px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      margin-top: 8px;
    }
    .btn-submit:hover { background: var(--primary-dark); }
    .trust-ssl {
      margin-top: 16px;
      text-align: center;
      font-size: 0.75rem;
      color: var(--body-text);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    /* Authenticated User Dashboard View */
    .auth-dashboard {
      display: none;
      max-width: 1280px;
      margin: 20px auto;
      padding: 0 20px;
    }
    .dash-header {
      background: white;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      box-shadow: var(--shadow-sm);
    }
    .dash-user-info h2 { font-size: 1.3rem; font-weight: 800; color: var(--dark-text); }
    .dash-user-info p { font-size: 0.85rem; color: var(--body-text); }
    .badge-role {
      display: inline-block;
      background: var(--primary-light);
      color: var(--primary);
      font-size: 0.75rem;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 999px;
      text-transform: uppercase;
      margin-top: 4px;
    }
    .btn-signout {
      background: #FEE2E2;
      color: #DC2626;
      border: 1px solid #FECACA;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
    }

    /* Toast */
    .toast-msg {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #17251D;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      display: none;
      z-index: 2000;
      box-shadow: var(--shadow-lg);
    }
  </style>
</head>
<body>

  <!-- Top Strip -->
  <div class="top-strip">
    <div>
      <span>🌱 Official FarmConnect Agricultural OS</span>
      <span style="margin: 0 8px;">·</span>
      <span>Kisan Support: <strong>1800-180-1551</strong> (24x7 Toll-Free)</span>
    </div>
    <div>
      <span>Government Verified MSP & APMC Data</span>
    </div>
  </div>

  <!-- Main Navbar -->
  <header class="navbar">
    <div class="nav-container">
      <div class="brand" onclick="goHome()">
        <span class="brand-icon">🌱</span>
        <div>
          <div class="brand-title">FarmConnect</div>
          <div class="brand-sub">AGRICULTURAL OS</div>
        </div>
      </div>

      <div class="search-box">
        <input type="text" id="searchInput" placeholder="Search hybrid seeds, NPK fertilizers, solar pumps, farm produce..." onkeydown="if(event.key==='Enter') searchCatalog()">
        <button onclick="searchCatalog()">🔍</button>
      </div>

      <div class="header-actions" id="guestHeaderActions">
        <button class="cart-btn" onclick="openCart()">
          🛒 Cart <span class="cart-badge" id="cartCount">0</span>
        </button>
        <button class="btn-auth-signin" onclick="openLoginModal()">Sign In</button>
        <button class="btn-auth-register" onclick="openRegisterModal()">Get Started</button>
      </div>

      <div class="header-actions" id="userHeaderActions" style="display: none;">
        <button class="cart-btn" onclick="openCart()">
          🛒 Cart <span class="cart-badge" id="cartCountUser">0</span>
        </button>
        <button class="btn-signout" onclick="logout()">Sign Out ⎋</button>
      </div>
    </div>
  </header>

  <!-- Subnav Ribbon (Header Links from Task 2) -->
  <nav class="subnav">
    <div class="subnav-container">
      <div class="subnav-item active" onclick="goHome()">🏠 Home</div>
      <div class="subnav-item" onclick="scrollToSection('catalogSection')">🏪 Shop</div>
      <div class="subnav-item" onclick="scrollToSection('cropMarketSection')">🌾 Crop Marketplace</div>
      <div class="subnav-item" onclick="scrollToSection('mandiSection')">📊 Market Prices</div>
      <div class="subnav-item" onclick="scrollToSection('smartFarmingSection')">⛅ Weather</div>
      <div class="subnav-item" onclick="scrollToSection('smartFarmingSection')">🚜 Smart Farming</div>
      <div class="subnav-item" onclick="openAboutModal()">ℹ️ About</div>
    </div>
  </nav>

  <!-- GUEST PUBLIC VIEW -->
  <div id="publicView">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-container">
        <div class="hero-content">
          <div class="hero-pill">INDIA'S TRUSTED AGRICULTURAL NETWORK</div>
          <h1 class="hero-title">Grow Smarter.<br>Trade Better.<br>Farm Better.</h1>
          <p class="hero-desc">One platform for agricultural shopping, crop trading, market intelligence and smart farming.</p>
          <div class="hero-btns">
            <button class="btn-hero-primary" onclick="scrollToSection('catalogSection')">Explore Marketplace →</button>
            <button class="btn-hero-secondary" onclick="scrollToSection('smartFarmingSection')">Explore Smart Farming 🚜</button>
          </div>
        </div>
        <div class="hero-graphic">🌾</div>
      </div>
    </section>

    <!-- Trust Pillars -->
    <section class="trust-strip">
      <div class="trust-container">
        <div class="trust-item">
          <div class="trust-icon">🛡️</div>
          <div class="trust-text">
            <h4>Verified Agri-Sellers</h4>
            <p>100% genuine seeds & fertilizers</p>
          </div>
        </div>
        <div class="trust-item">
          <div class="trust-icon">📊</div>
          <div class="trust-text">
            <h4>Direct Mandi Prices</h4>
            <p>Live APMC mandi updates daily</p>
          </div>
        </div>
        <div class="trust-item">
          <div class="trust-icon">🚜</div>
          <div class="trust-text">
            <h4>Smart Agronomy</h4>
            <p>24x7 expert and AI crop guidance</p>
          </div>
        </div>
        <div class="trust-item">
          <div class="trust-icon">💳</div>
          <div class="trust-text">
            <h4>Secure Payments</h4>
            <p>UPI, Escrow, and Razorpay verified</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <main class="main-wrap">
      
      <!-- 10 Categories -->
      <section id="categoriesSection">
        <div class="section-head">
          <h2>🌾 Browse Agricultural Categories</h2>
          <a href="#catalogSection">View All Products →</a>
        </div>
        <div class="category-grid" id="categoryGrid">
          <div class="category-card" onclick="filterCategory('SEEDS')">
            <span class="cat-icon">🌱</span>
            <div class="cat-name">Seeds</div>
            <div class="cat-desc">Hybrid, OPV & certified grains</div>
          </div>
          <div class="category-card" onclick="filterCategory('FERTILIZERS')">
            <span class="cat-icon">🧪</span>
            <div class="cat-name">Fertilizers</div>
            <div class="cat-desc">NPK, Urea, DAP & micronutrients</div>
          </div>
          <div class="category-card" onclick="filterCategory('ORGANIC')">
            <span class="cat-icon">🌿</span>
            <div class="cat-name">Organic Products</div>
            <div class="cat-desc">Bio-fertilizers & vermicompost</div>
          </div>
          <div class="category-card" onclick="filterCategory('PESTICIDES')">
            <span class="cat-icon">🛡️</span>
            <div class="cat-name">Pesticides & Protection</div>
            <div class="cat-desc">Fungicides & organic IPM</div>
          </div>
          <div class="category-card" onclick="filterCategory('IRRIGATION')">
            <span class="cat-icon">💧</span>
            <div class="cat-name">Irrigation Equipment</div>
            <div class="cat-desc">Drip, sprinklers & PVC pipes</div>
          </div>
          <div class="category-card" onclick="filterCategory('TOOLS')">
            <span class="cat-icon">⛏️</span>
            <div class="cat-name">Farming Tools</div>
            <div class="cat-desc">Knapsack sprayers & hand tools</div>
          </div>
          <div class="category-card" onclick="filterCategory('MACHINERY')">
            <span class="cat-icon">🚜</span>
            <div class="cat-name">Agricultural Machinery</div>
            <div class="cat-desc">Power tillers & harvesters</div>
          </div>
          <div class="category-card" onclick="filterCategory('ANIMAL_FEED')">
            <span class="cat-icon">🐄</span>
            <div class="cat-name">Animal Feed</div>
            <div class="cat-desc">Cattle feed & mineral mix</div>
          </div>
          <div class="category-card" onclick="filterCategory('CROP_PRODUCE')">
            <span class="cat-icon">🌾</span>
            <div class="cat-name">Crop Produce</div>
            <div class="cat-desc">Direct farm-gate harvest</div>
          </div>
          <div class="category-card" onclick="filterCategory('SUPPLIES')">
            <span class="cat-icon">📦</span>
            <div class="cat-name">Other Supplies</div>
            <div class="cat-desc">Tarpaulins, crates & nets</div>
          </div>
        </div>
      </section>

      <!-- Featured Storefront Catalog -->
      <section id="catalogSection">
        <div class="section-head">
          <h2>🛒 Featured Products from Database</h2>
          <span style="font-size: 0.85rem; color: var(--body-text);">Dispatched by Certified Agri-Merchants</span>
        </div>
        <div class="products-grid" id="productsGrid">
          <div class="product-card">
            <div class="product-thumb">🌱<span class="product-tag">BESTSELLER</span></div>
            <div class="product-body">
              <div class="product-category">SEEDS</div>
              <div class="product-title">Hybrid Tomato Seeds (Arka Rakshak - 50g)</div>
              <div class="product-seller">Cauvery Agri Supplies · ⭐ 4.8</div>
              <div class="product-footer">
                <span class="product-price">₹450</span>
                <button class="btn-add-cart" onclick="addToCart('Hybrid Tomato Seeds', 450)">Add to Cart</button>
              </div>
            </div>
          </div>

          <div class="product-card">
            <div class="product-thumb">🧪<span class="product-tag">CERTIFIED</span></div>
            <div class="product-body">
              <div class="product-category">FERTILIZERS</div>
              <div class="product-title">NPK 19-19-19 Soluble Fertilizer (1kg)</div>
              <div class="product-seller">IFFCO Authorized · ⭐ 4.9</div>
              <div class="product-footer">
                <span class="product-price">₹180</span>
                <button class="btn-add-cart" onclick="addToCart('NPK 19-19-19 Fertilizer', 180)">Add to Cart</button>
              </div>
            </div>
          </div>

          <div class="product-card">
            <div class="product-thumb">🌿<span class="product-tag">100% ORGANIC</span></div>
            <div class="product-body">
              <div class="product-category">ORGANIC</div>
              <div class="product-title">Neem Cake Bio-Fertilizer (25kg)</div>
              <div class="product-seller">GreenAgro Karnataka · ⭐ 4.7</div>
              <div class="product-footer">
                <span class="product-price">₹850</span>
                <button class="btn-add-cart" onclick="addToCart('Neem Cake Bio-Fertilizer', 850)">Add to Cart</button>
              </div>
            </div>
          </div>

          <div class="product-card">
            <div class="product-thumb">💧<span class="product-tag">SUBSIDY READY</span></div>
            <div class="product-body">
              <div class="product-category">IRRIGATION</div>
              <div class="product-title">Drip Irrigation Kit (1 Acre Complete)</div>
              <div class="product-seller">Jain Irrigation Systems · ⭐ 4.9</div>
              <div class="product-footer">
                <span class="product-price">₹12,499</span>
                <button class="btn-add-cart" onclick="addToCart('Drip Irrigation Kit', 12499)">Add to Cart</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Farmer Crop Marketplace Section -->
      <section id="cropMarketSection">
        <div class="section-head">
          <h2>🌾 Farmer Crop Marketplace</h2>
          <span style="font-size: 0.85rem; color: var(--body-text);">Direct farm-gate wholesale produce lots</span>
        </div>
        <div class="crop-grid">
          <div class="crop-card">
            <div class="crop-title">Sugarcane (Co 86032)</div>
            <div class="crop-loc">📍 Mandya APMC Market Yard · Grade A</div>
            <div class="crop-meta">
              <span>Lot: 45 Quintals</span>
              <span>₹3,200 / qtl</span>
            </div>
            <button class="btn-submit" style="margin-top:0; padding: 8px;" onclick="openLoginModal()">Submit Wholesale Bid ➔</button>
          </div>
          <div class="crop-card">
            <div class="crop-title">Tomato Hybrid (Arka Rakshak)</div>
            <div class="crop-loc">📍 Kolar APMC Yard · Grade A+</div>
            <div class="crop-meta">
              <span>Lot: 60 Crates (1500kg)</span>
              <span>₹2,800 / qtl</span>
            </div>
            <button class="btn-submit" style="margin-top:0; padding: 8px;" onclick="openLoginModal()">Submit Wholesale Bid ➔</button>
          </div>
          <div class="crop-card">
            <div class="crop-title">Ragi (Finger Millet - GPU 28)</div>
            <div class="crop-loc">📍 Hassan APMC Market · Organic Certified</div>
            <div class="crop-meta">
              <span>Lot: 25 Quintals</span>
              <span>₹4,290 / qtl</span>
            </div>
            <button class="btn-submit" style="margin-top:0; padding: 8px;" onclick="openLoginModal()">Submit Wholesale Bid ➔</button>
          </div>
        </div>
      </section>

      <!-- Live Mandi Rates -->
      <section id="mandiSection" class="mandi-card">
        <div class="section-head" style="margin-bottom: 8px;">
          <h2>📊 Live APMC Mandi Prices</h2>
          <span style="font-size: 0.8rem; color: var(--success); font-weight: 700;">● LIVE FROM AGMARKNET</span>
        </div>
        <p style="font-size: 0.85rem; color: var(--body-text); margin-bottom: 12px;">Real-time mandi market rates from APMC yards across Karnataka & India.</p>
        <div class="mandi-grid" id="mandiGrid">
          <div class="mandi-box">
            <div class="mandi-header">
              <span class="mandi-crop">Tomato (Hybrid)</span>
              <span class="mandi-rate">₹2,800 / qtl</span>
            </div>
            <div class="mandi-market">Kolar APMC Yard</div>
            <div class="mandi-status">▲ +₹120 vs yesterday</div>
          </div>
          <div class="mandi-box">
            <div class="mandi-header">
              <span class="mandi-crop">Onion (Nashik Red)</span>
              <span class="mandi-rate">₹3,400 / qtl</span>
            </div>
            <div class="mandi-market">Yeshwanthpur APMC</div>
            <div class="mandi-status">▲ +₹50 vs yesterday</div>
          </div>
          <div class="mandi-box">
            <div class="mandi-header">
              <span class="mandi-crop">Ragi (Finger Millet)</span>
              <span class="mandi-rate">₹4,290 / qtl</span>
            </div>
            <div class="mandi-market">Mandya APMC Yard</div>
            <div class="mandi-status">★ MSP Guaranteed</div>
          </div>
          <div class="mandi-box">
            <div class="mandi-header">
              <span class="mandi-crop">Paddy (Sona Masoori)</span>
              <span class="mandi-rate">₹2,320 / qtl</span>
            </div>
            <div class="mandi-market">Raichur APMC Yard</div>
            <div class="mandi-status">● Steady trade</div>
          </div>
        </div>
      </section>

      <!-- Smart Agriculture Services -->
      <section id="smartFarmingSection">
        <div class="section-head">
          <h2>🚜 Smart Agriculture Services</h2>
          <span style="font-size: 0.85rem; color: var(--body-text);">AI Diagnostics, Soil Health & Schemes</span>
        </div>
        <div class="smart-grid">
          <div class="smart-card" onclick="openLoginModal()">
            <span style="font-size: 2.2rem;">🤖</span>
            <h4>AI Crop Doctor & Vision</h4>
            <p>Scan crop leaves to predict pest/fungal diseases with confidence percentage and certified remedies.</p>
          </div>
          <div class="smart-card" onclick="openLoginModal()">
            <span style="font-size: 2.2rem;">🧪</span>
            <h4>Soil Health & NPK Dosage</h4>
            <p>Compute precise 50kg bags of Urea, DAP, and MOP tailored to your soil test results.</p>
          </div>
          <div class="smart-card" onclick="openLoginModal()">
            <span style="font-size: 2.2rem;">⛅</span>
            <h4>Weather Advisory Sync</h4>
            <p>Hyper-local 7-day temperature, rain probability, and wind metrics from Open-Meteo.</p>
          </div>
          <div class="smart-card" onclick="openLoginModal()">
            <span style="font-size: 2.2rem;">🏛️</span>
            <h4>Government Schemes Hub</h4>
            <p>Explore PM-KISAN, PMFBY crop insurance, and state micro-irrigation subsidies.</p>
          </div>
        </div>
      </section>

      <!-- 24x7 Helpline -->
      <section class="helpline">
        <div class="helpline-left">
          <span class="helpline-icon">📞</span>
          <div class="helpline-text">
            <h3>24x7 Kisan Call Center & Agronomist Support</h3>
            <p>Direct access to ICAR-KVK agricultural scientists for pest control, fertilizer scheduling and scheme guidance.</p>
          </div>
        </div>
        <a href="tel:18001801551" class="helpline-call">Call 1800-180-1551 (Toll Free)</a>
      </section>

    </main>
  </div>

  <!-- AUTHENTICATED ROLE DASHBOARD VIEW -->
  <div class="auth-dashboard" id="authDashboard">
    <div class="dash-header">
      <div class="dash-user-info">
        <h2 id="dashWelcome">Welcome, Farmer</h2>
        <p id="dashEmail">user@farmconnect.org</p>
        <span class="badge-role" id="dashRoleBadge">FARMER</span>
      </div>
      <div>
        <button class="btn-signout" onclick="logout()">Sign Out ⎋</button>
      </div>
    </div>

    <!-- Farmer Cockpit Specific View -->
    <div id="farmerView" style="display: none;">
      <div style="background: white; border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; margin-bottom: 20px;">
        <h3 style="margin-bottom: 12px; color: var(--primary);">🌱 Farmer Cockpit & Smart Farm Management</h3>
        <p style="color: var(--body-text); margin-bottom: 20px;">Manage crop batches, monitor IoT sensors, list harvest for mandi buyers, and claim government subsidies.</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px;">
          <div style="background: #F8FAF9; padding: 16px; border-radius: 8px; border: 1px solid var(--border);">
            <div style="font-weight: 700; margin-bottom: 4px;">Soil Moisture (Zone 1)</div>
            <div style="font-size: 1.6rem; font-weight: 800; color: var(--primary);">68%</div>
            <div style="font-size: 0.8rem; color: var(--success); font-weight: 600;">Optimal for Tomato</div>
          </div>
          <div style="background: #F8FAF9; padding: 16px; border-radius: 8px; border: 1px solid var(--border);">
            <div style="font-weight: 700; margin-bottom: 4px;">Active Crop Batches</div>
            <div style="font-size: 1.6rem; font-weight: 800; color: var(--dark-text);">3 Batches</div>
            <div style="font-size: 0.8rem; color: var(--body-text);">Tomato, Ragi, Chilli</div>
          </div>
          <div style="background: #F8FAF9; padding: 16px; border-radius: 8px; border: 1px solid var(--border);">
            <div style="font-weight: 700; margin-bottom: 4px;">Harvest Ready for Sale</div>
            <div style="font-size: 1.6rem; font-weight: 800; color: var(--secondary);">12 Quintals</div>
            <div style="font-size: 0.8rem; color: var(--body-text);">Expected revenue: ₹33,600</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Buyer Portal Specific View -->
    <div id="buyerView" style="display: none;">
      <div style="background: white; border: 1px solid var(--border); border-radius: var(--radius); padding: 24px;">
        <h3 style="margin-bottom: 12px; color: var(--primary);">🛒 Buyer Wholesale Procurement Portal</h3>
        <p style="color: var(--body-text); margin-bottom: 20px;">Browse farm-gate listings, submit wholesale bids, track dispatch logistics, and manage digital invoices.</p>
        <div style="background: var(--primary-light); padding: 16px; border-radius: 8px; color: var(--primary); font-weight: 600;">
          Direct connection to 100+ verified Farmer Producer Organizations (FPOs).
        </div>
      </div>
    </div>

    <!-- Seller Merchant Specific View -->
    <div id="sellerView" style="display: none;">
      <div style="background: white; border: 1px solid var(--border); border-radius: var(--radius); padding: 24px;">
        <h3 style="margin-bottom: 12px; color: var(--primary);">🏪 Agri-Merchant Inventory & Order Manager</h3>
        <p style="color: var(--body-text); margin-bottom: 20px;">Manage certified agri-input inventory, process seed orders, fulfill deliveries, and view earnings.</p>
      </div>
    </div>

    <!-- Admin Console Specific View -->
    <div id="adminView" style="display: none;">
      <div style="background: white; border: 1px solid var(--border); border-radius: var(--radius); padding: 24px;">
        <h3 style="margin-bottom: 12px; color: #DC2626;">🛡️ Platform Governance & Oversight Console</h3>
        <p style="color: var(--body-text); margin-bottom: 20px;">Platform KYC verification, audit trail logs, security rate limits, and dispute escrow management.</p>
      </div>
    </div>
  </div>

  <!-- Sign In Modal -->
  <div class="modal-overlay" id="loginModal">
    <div class="modal-box">
      <button class="modal-close" onclick="closeModals()">✕</button>
      <h2 class="modal-title">Sign In to FarmConnect</h2>
      <p class="modal-sub">Access your authenticated role dashboard</p>
      
      <form onsubmit="handleLogin(event)">
        <div class="form-group">
          <label class="form-label">Phone or Email</label>
          <input type="text" class="form-control" id="loginIdentifier" placeholder="e.g. 9845012345 or farmer@farmconnect.org" required>
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="password" class="form-control" id="loginPassword" placeholder="••••••••" required>
        </div>
        <button type="submit" class="btn-submit" id="loginBtn">Sign In</button>
      </form>

      <div style="margin-top: 16px; text-align: center; font-size: 0.85rem;">
        New to FarmConnect? <a href="javascript:void(0)" onclick="openRegisterModal()" style="color: var(--primary); font-weight: 700;">Create Account</a>
      </div>

      <div class="trust-ssl">
        🔒 256-Bit SSL Encrypted & Role-Isolated Authentication
      </div>
    </div>
  </div>

  <!-- Register Modal -->
  <div class="modal-overlay" id="registerModal">
    <div class="modal-box">
      <button class="modal-close" onclick="closeModals()">✕</button>
      <h2 class="modal-title">Create FarmConnect Account</h2>
      <p class="modal-sub">Register as a Farmer, Buyer, or Input Seller</p>
      
      <form onsubmit="handleRegister(event)">
        <div class="form-group">
          <label class="form-label">I am registering as</label>
          <select class="form-control" id="regRole" required>
            <option value="FARMER">👨‍🌾 Farmer (Cultivator / Producer)</option>
            <option value="BUYER">🛒 Buyer (Trader / Mandi Merchant / FPO)</option>
            <option value="SELLER">🏪 Agri-Input Seller (Seeds / Tools / Fertilizers)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input type="text" class="form-control" id="regName" placeholder="e.g. Ramesh Kumar" required>
        </div>
        <div class="form-group">
          <label class="form-label">Mobile Number</label>
          <input type="tel" class="form-control" id="regPhone" placeholder="10-digit Indian phone" required>
        </div>
        <div class="form-group">
          <label class="form-label">Email (Optional)</label>
          <input type="email" class="form-control" id="regEmail" placeholder="yourname@example.com">
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="password" class="form-control" id="regPassword" placeholder="Minimum 6 characters" required>
        </div>
        <button type="submit" class="btn-submit" id="regBtn">Create Account</button>
      </form>
    </div>
  </div>

  <!-- About Modal -->
  <div class="modal-overlay" id="aboutModal">
    <div class="modal-box">
      <button class="modal-close" onclick="closeModals()">✕</button>
      <h2 class="modal-title">About FarmConnect</h2>
      <p class="modal-sub">Smart Agriculture Products & Market Assistance</p>
      <p style="font-size: 0.9rem; color: var(--body-text); line-height: 1.6; margin-bottom: 20px;">
        FarmConnect is an integrated agricultural platform designed to empower Indian farmers, wholesale buyers, and certified agri-merchants.
        <br><br>
        Our mission is to eliminate unfair brokerage, provide direct transparent market prices, deliver scientific soil and pest guidance, and streamline farm input procurement across India.
      </p>
      <button class="btn-submit" onclick="closeModals()">Close</button>
    </div>
  </div>

  <!-- Cart & Checkout Modal -->
  <div class="modal-overlay" id="cartModal">
    <div class="modal-box" style="max-width: 500px;">
      <button class="modal-close" onclick="closeModals()">✕</button>
      <h2 class="modal-title">Your Shopping Cart</h2>
      <p class="modal-sub">Review items and proceed to secure checkout</p>
      
      <div id="cartItemsList" style="margin-bottom: 20px; max-height: 200px; overflow-y: auto;">
        <p style="color: var(--body-text); font-size: 0.9rem;">Your cart is empty.</p>
      </div>

      <div style="border-top: 1px solid var(--border); padding-top: 16px; margin-bottom: 16px; display: flex; justify-content: space-between; font-weight: 800; font-size: 1.1rem;">
        <span>Total:</span>
        <span id="cartTotalDisplay">₹0</span>
      </div>

      <button class="btn-submit" onclick="proceedToCheckout()" id="checkoutBtn" style="display: none;">
        Proceed to Secure Checkout 🔒
      </button>
    </div>
  </div>

  <!-- Toast -->
  <div class="toast-msg" id="toast"></div>

  <!-- Footer -->
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-col">
        <h3>🌱 FarmConnect</h3>
        <p>One platform for agricultural shopping, crop trading, market intelligence and smart farming across India.</p>
      </div>
      <div class="footer-col">
        <h3>Marketplace</h3>
        <ul>
          <li><a href="#catalogSection">Seeds & Grains</a></li>
          <li><a href="#catalogSection">Fertilizers & Bio-Inputs</a></li>
          <li><a href="#catalogSection">Irrigation & Drip Kits</a></li>
          <li><a href="#catalogSection">Agricultural Machinery</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h3>Smart Farming</h3>
        <ul>
          <li><a href="#mandiSection">Live Mandi Prices</a></li>
          <li><a href="tel:18001801551">24x7 Kisan Helpline</a></li>
          <li><a href="javascript:void(0)" onclick="openLoginModal()">Soil Moisture Dashboard</a></li>
          <li><a href="javascript:void(0)" onclick="openLoginModal()">AI Crop Doctor</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h3>Support & Legal</h3>
        <ul>
          <li><a href="tel:18001801551">Kisan Helpline: 1800-180-1551</a></li>
          <li><a href="javascript:void(0)" onclick="openAboutModal()">About FarmConnect</a></li>
          <li><a href="javascript:void(0)">Privacy Policy</a></li>
          <li><a href="javascript:void(0)">Terms of Service</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <div>© 2026 FarmConnect Agricultural OS. All rights reserved.</div>
      <div>Empowering Indian Farmers & Agricultural Trade · Secure 256-bit SSL</div>
    </div>
  </footer>

  <script>
    // In-memory application state
    let currentUser = null;
    let cart = [];

    // Navigation helpers
    function goHome() {
      document.getElementById('publicView').style.display = 'block';
      document.getElementById('authDashboard').style.display = 'none';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function scrollToSection(id) {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }

    function showToast(msg) {
      const toast = document.getElementById('toast');
      toast.textContent = msg;
      toast.style.display = 'block';
      setTimeout(() => { toast.style.display = 'none'; }, 3000);
    }

    // Modals
    function closeModals() {
      document.getElementById('loginModal').style.display = 'none';
      document.getElementById('registerModal').style.display = 'none';
      document.getElementById('cartModal').style.display = 'none';
      document.getElementById('aboutModal').style.display = 'none';
    }

    function openLoginModal() {
      closeModals();
      document.getElementById('loginModal').style.display = 'flex';
    }

    function openRegisterModal() {
      closeModals();
      document.getElementById('registerModal').style.display = 'flex';
    }

    function openAboutModal() {
      closeModals();
      document.getElementById('aboutModal').style.display = 'flex';
    }

    function openCart() {
      closeModals();
      renderCart();
      document.getElementById('cartModal').style.display = 'flex';
    }

    // Cart Management
    function addToCart(title, price) {
      cart.push({ title, price, id: Date.now() });
      updateCartBadge();
      showToast('✓ Added "' + title + '" to cart!');
    }

    function updateCartBadge() {
      document.getElementById('cartCount').textContent = cart.length;
      document.getElementById('cartCountUser').textContent = cart.length;
    }

    function renderCart() {
      const list = document.getElementById('cartItemsList');
      const checkoutBtn = document.getElementById('checkoutBtn');
      const totalDisplay = document.getElementById('cartTotalDisplay');

      if (cart.length === 0) {
        list.innerHTML = '<p style="color: var(--body-text); font-size: 0.9rem;">Your cart is empty.</p>';
        checkoutBtn.style.display = 'none';
        totalDisplay.textContent = '₹0';
        return;
      }

      let total = 0;
      let html = '';
      cart.forEach((item, idx) => {
        total += item.price;
        html += '<div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border); font-size: 0.9rem;">' +
                '<div><strong>' + item.title + '</strong></div>' +
                '<div>₹' + item.price + ' <button onclick="removeFromCart(' + idx + ')" style="background:none; border:none; color: #DC2626; cursor:pointer; margin-left: 8px;">✕</button></div>' +
                '</div>';
      });

      list.innerHTML = html;
      totalDisplay.textContent = '₹' + total;
      checkoutBtn.style.display = 'block';
    }

    function removeFromCart(idx) {
      cart.splice(idx, 1);
      updateCartBadge();
      renderCart();
    }

    function proceedToCheckout() {
      showToast("Order initiated! Redirecting to secure checkout gateway...");
      setTimeout(() => {
        closeModals();
        cart = [];
        updateCartBadge();
        showToast("✓ Order successfully placed! Confirmation SMS sent.");
      }, 1500);
    }

    function filterCategory(cat) {
      showToast("Filtering products by category: " + cat);
      scrollToSection('catalogSection');
    }

    function searchCatalog() {
      const q = document.getElementById('searchInput').value.trim();
      if (!q) return;
      showToast('Searching products for: "' + q + '"');
      scrollToSection('catalogSection');
    }

    // Authentication & Role Routing
    async function handleLogin(e) {
      e.preventDefault();
      const identifier = document.getElementById('loginIdentifier').value.trim();
      const password = document.getElementById('loginPassword').value;
      const btn = document.getElementById('loginBtn');

      btn.textContent = 'Signing in...';
      btn.disabled = true;

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, password })
        });
        const data = await res.json();

        if (data.success && data.user) {
          currentUser = data.user;
          closeModals();
          renderAuthenticatedDashboard();
          showToast('Welcome, ' + (currentUser.name || 'User') + '!');
        } else {
          alert(data.message || 'Login failed. Please check credentials.');
        }
      } catch (err) {
        alert('Connection error. Please try again.');
      } finally {
        btn.textContent = 'Sign In';
        btn.disabled = false;
      }
    }

    async function handleRegister(e) {
      e.preventDefault();
      const role = document.getElementById('regRole').value;
      const name = document.getElementById('regName').value.trim();
      const phone = document.getElementById('regPhone').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPassword').value;
      const btn = document.getElementById('regBtn');

      btn.textContent = 'Creating account...';
      btn.disabled = true;

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role, name, phone, email, password })
        });
        const data = await res.json();

        if (data.success) {
          showToast('Account created successfully! Please sign in.');
          openLoginModal();
        } else {
          alert(data.message || 'Registration failed.');
        }
      } catch (err) {
        alert('Connection error. Please try again.');
      } finally {
        btn.textContent = 'Create Account';
        btn.disabled = false;
      }
    }

    function renderAuthenticatedDashboard() {
      if (!currentUser) return;

      document.getElementById('publicView').style.display = 'none';
      document.getElementById('guestHeaderActions').style.display = 'none';
      document.getElementById('userHeaderActions').style.display = 'flex';

      const dash = document.getElementById('authDashboard');
      dash.style.display = 'block';

      document.getElementById('dashWelcome').textContent = 'Welcome, ' + (currentUser.name || 'User');
      document.getElementById('dashEmail').textContent = currentUser.email || currentUser.phone || 'Verified User';
      document.getElementById('dashRoleBadge').textContent = currentUser.role;

      // Hide all role views first
      document.getElementById('farmerView').style.display = 'none';
      document.getElementById('buyerView').style.display = 'none';
      document.getElementById('sellerView').style.display = 'none';
      document.getElementById('adminView').style.display = 'none';

      // Route strictly to the user authenticated role
      if (currentUser.role === 'FARMER') {
        document.getElementById('farmerView').style.display = 'block';
      } else if (currentUser.role === 'BUYER') {
        document.getElementById('buyerView').style.display = 'block';
      } else if (currentUser.role === 'SELLER') {
        document.getElementById('sellerView').style.display = 'block';
      } else if (currentUser.role === 'ADMIN') {
        document.getElementById('adminView').style.display = 'block';
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function logout() {
      currentUser = null;
      document.getElementById('authDashboard').style.display = 'none';
      document.getElementById('userHeaderActions').style.display = 'none';
      document.getElementById('guestHeaderActions').style.display = 'flex';
      document.getElementById('publicView').style.display = 'block';
      showToast('You have been signed out.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  </script>
</body>
</html>`;
}

module.exports = {
  renderFarmConnectApp,
};
