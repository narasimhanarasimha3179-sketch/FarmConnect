// FarmConnect Crop Marketplace Controller (Phase 8)
// Direct Farmer-to-Buyer produce trade, harvest schedules, quality grades & enquiries

const db = require('../config/database');
const crypto = require('crypto');

/**
 * GET /api/crop-market/listings
 * Active farm harvest listings with filters (crop_name, location, quality_grade, price)
 */
function getCropListings(req, res) {
  try {
    const { crop_name, mandi_location, quality_grade, max_price, status = 'AVAILABLE', sort = 'newest' } = req.query;

    let query = 'SELECT * FROM crops_market WHERE 1=1';
    const params = [];

    if (status && status !== 'ALL') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (crop_name) {
      query += ' AND (crop_name LIKE ? OR variety LIKE ?)';
      params.push(`%${crop_name}%`, `%${crop_name}%`);
    }

    if (mandi_location) {
      query += ' AND mandi_location LIKE ?';
      params.push(`%${mandi_location}%`);
    }

    if (quality_grade) {
      query += ' AND quality_grade = ?';
      params.push(quality_grade);
    }

    if (max_price) {
      query += ' AND expected_price <= ?';
      params.push(parseFloat(max_price));
    }

    // Sort order
    if (sort === 'price_asc') {
      query += ' ORDER BY expected_price ASC';
    } else if (sort === 'price_desc') {
      query += ' ORDER BY expected_price DESC';
    } else if (sort === 'harvest_date') {
      query += ' ORDER BY harvest_date ASC';
    } else {
      query += ' ORDER BY created_at DESC';
    }

    const listings = db.prepare(query).all(...params);

    return res.status(200).json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (err) {
    console.error('getCropListings error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load crop marketplace listings.' });
  }
}

/**
 * GET /api/crop-market/listings/:id
 * Single crop batch details with farmer contacts and enquiry count
 */
function getCropListingById(req, res) {
  try {
    const { id } = req.params;
    const crop = db.prepare(`
      SELECT cm.*, u.phone as farmer_phone, u.email as farmer_email, fp.village, fp.district, fp.state
      FROM crops_market cm
      LEFT JOIN users u ON cm.farmer_id = u.id
      LEFT JOIN farmer_profiles fp ON cm.farmer_id = fp.user_id
      WHERE cm.id = ?
    `).get(id);

    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop listing not found.' });
    }

    const enquiriesCount = db.prepare('SELECT COUNT(*) as count FROM crop_enquiries WHERE crop_id = ?').get(id).count;

    return res.status(200).json({
      success: true,
      data: {
        ...crop,
        total_enquiries: enquiriesCount,
      },
    });
  } catch (err) {
    console.error('getCropListingById error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve crop listing.' });
  }
}

/**
 * POST /api/crop-market/listings
 * Farmer creates new agricultural crop harvest listing
 */
function createCropListing(req, res) {
  try {
    const {
      crop_name,
      variety,
      quantity_available,
      unit = 'Quintal',
      expected_price,
      mandi_location,
      quality_grade = 'Grade A',
      harvest_date,
      description,
      image_url,
    } = req.body;

    if (!crop_name || !variety || !quantity_available || !expected_price || !mandi_location) {
      return res.status(400).json({
        success: false,
        message: 'Crop name, variety, quantity, price, and location are required.',
      });
    }

    const id = 'crop_m_' + crypto.randomBytes(4).toString('hex');
    const now = new Date().toISOString();
    const hDate = harvest_date || now.split('T')[0];

    db.prepare(`
      INSERT INTO crops_market (
        id, farmer_id, farmer_name, crop_name, variety, quantity_available, unit,
        expected_price, mandi_location, quality_grade, harvest_date, description, image_url, status, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'AVAILABLE', ?)
    `).run(
      id,
      req.user.id,
      req.user.name,
      crop_name.trim(),
      variety.trim(),
      parseFloat(quantity_available),
      unit,
      parseFloat(expected_price),
      mandi_location.trim(),
      quality_grade,
      hDate,
      description || '',
      image_url || 'https://images.unsplash.com/photo-1596704017254-9b121068fb31',
      now
    );

    return res.status(201).json({
      success: true,
      message: `Crop harvest listing for ${crop_name} (${variety}) published successfully.`,
      data: { id, crop_name, variety, quantity_available, expected_price, status: 'AVAILABLE' },
    });
  } catch (err) {
    console.error('createCropListing error:', err);
    return res.status(500).json({ success: false, message: 'Failed to publish crop listing.' });
  }
}

/**
 * PUT /api/crop-market/listings/:id
 * Farmer updates harvest quantity, price or availability status
 */
function updateCropListing(req, res) {
  try {
    const { id } = req.params;
    const { quantity_available, expected_price, status, description, mandi_location } = req.body;

    const crop = db.prepare('SELECT * FROM crops_market WHERE id = ?').get(id);
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop listing not found.' });
    }

    // Authorization: only the listing owner or ADMIN can update
    if (crop.farmer_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'You are not authorized to update this listing.' });
    }

    const updatedQty = quantity_available !== undefined ? parseFloat(quantity_available) : crop.quantity_available;
    const updatedPrice = expected_price !== undefined ? parseFloat(expected_price) : crop.expected_price;
    const updatedStatus = status || crop.status;
    const updatedDesc = description !== undefined ? description : crop.description;
    const updatedLoc = mandi_location || crop.mandi_location;

    db.prepare(`
      UPDATE crops_market
      SET quantity_available = ?, expected_price = ?, status = ?, description = ?, mandi_location = ?
      WHERE id = ?
    `).run(updatedQty, updatedPrice, updatedStatus, updatedDesc, updatedLoc, id);

    return res.status(200).json({
      success: true,
      message: 'Crop listing updated successfully.',
      data: { id, quantity_available: updatedQty, expected_price: updatedPrice, status: updatedStatus },
    });
  } catch (err) {
    console.error('updateCropListing error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update crop listing.' });
  }
}

/**
 * DELETE /api/crop-market/listings/:id
 * Farmer removes crop listing
 */
function deleteCropListing(req, res) {
  try {
    const { id } = req.params;
    const crop = db.prepare('SELECT * FROM crops_market WHERE id = ?').get(id);
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop listing not found.' });
    }

    if (crop.farmer_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this listing.' });
    }

    db.prepare('DELETE FROM crops_market WHERE id = ?').run(id);

    return res.status(200).json({
      success: true,
      message: `Crop listing #${id} removed successfully.`,
    });
  } catch (err) {
    console.error('deleteCropListing error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete crop listing.' });
  }
}

/**
 * POST /api/crop-market/enquiries
 * Buyer submits purchase enquiry or price bid to farmer
 */
function createCropEnquiry(req, res) {
  try {
    const { crop_id, offered_price, quantity_requested, unit = 'Quintal', message } = req.body;

    if (!crop_id || !offered_price || !quantity_requested) {
      return res.status(400).json({ success: false, message: 'Crop ID, offered price, and requested quantity are required.' });
    }

    const crop = db.prepare('SELECT id, farmer_id, crop_name, expected_price FROM crops_market WHERE id = ?').get(crop_id);
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop listing does not exist.' });
    }

    const id = 'enq_' + crypto.randomBytes(4).toString('hex');
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO crop_enquiries (id, crop_id, farmer_id, buyer_id, buyer_name, buyer_phone, offered_price, quantity_requested, unit, message, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)
    `).run(
      id,
      crop_id,
      crop.farmer_id,
      req.user.id,
      req.user.name,
      req.user.phone || '9999999999',
      parseFloat(offered_price),
      parseFloat(quantity_requested),
      unit,
      message || '',
      now
    );

    return res.status(201).json({
      success: true,
      message: `Direct purchase enquiry sent to farmer for ${crop.crop_name}.`,
      data: { id, crop_id, offered_price, quantity_requested, status: 'PENDING' },
    });
  } catch (err) {
    console.error('createCropEnquiry error:', err);
    return res.status(500).json({ success: false, message: 'Failed to send crop enquiry.' });
  }
}

/**
 * GET /api/crop-market/farmer/enquiries
 * Farmer retrieves enquiries submitted by wholesale buyers
 */
function getFarmerEnquiries(req, res) {
  try {
    const enquiries = db.prepare(`
      SELECT ce.*, cm.crop_name, cm.variety, cm.expected_price
      FROM crop_enquiries ce
      JOIN crops_market cm ON ce.crop_id = cm.id
      WHERE ce.farmer_id = ? OR cm.farmer_id = ?
      ORDER BY ce.created_at DESC
    `).all(req.user.id, req.user.id);

    return res.status(200).json({
      success: true,
      count: enquiries.length,
      data: enquiries,
    });
  } catch (err) {
    console.error('getFarmerEnquiries error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load buyer enquiries.' });
  }
}

/**
 * PUT /api/crop-market/enquiries/:id/status
 * Farmer accepts or declines buyer procurement offer
 */
function updateEnquiryStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACCEPTED', 'DECLINED', 'PENDING'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be ACCEPTED or DECLINED.' });
    }

    const enquiry = db.prepare('SELECT * FROM crop_enquiries WHERE id = ?').get(id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    }

    if (enquiry.farmer_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to respond to this enquiry.' });
    }

    db.prepare('UPDATE crop_enquiries SET status = ? WHERE id = ?').run(status, id);

    return res.status(200).json({
      success: true,
      message: `Buyer offer marked as ${status}.`,
      data: { id, status },
    });
  } catch (err) {
    console.error('updateEnquiryStatus error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update enquiry status.' });
  }
}

/**
 * GET /api/crop-market/buyer/enquiries
 * Buyer retrieves counter-offers/enquiries they have submitted to farmers
 */
function getBuyerEnquiries(req, res) {
  try {
    const enquiries = db.prepare(`
      SELECT ce.*, cm.crop_name, cm.variety, cm.expected_price, cm.mandi_location
      FROM crop_enquiries ce
      JOIN crops_market cm ON ce.crop_id = cm.id
      WHERE ce.buyer_id = ?
      ORDER BY ce.created_at DESC
    `).all(req.user.id);

    return res.status(200).json({
      success: true,
      count: enquiries.length,
      data: enquiries,
    });
  } catch (err) {
    console.error('getBuyerEnquiries error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve buyer enquiries.' });
  }
}

/**
 * GET /api/crop-market/farmer/my-listings
 * Farmer retrieves their own published crop listings
 */
function getFarmerMyListings(req, res) {
  try {
    const listings = db.prepare(`
      SELECT cm.*, 
        (SELECT COUNT(*) FROM crop_enquiries ce WHERE ce.crop_id = cm.id) as enquiry_count
      FROM crops_market cm
      WHERE cm.farmer_id = ?
      ORDER BY cm.created_at DESC
    `).all(req.user.id);

    return res.status(200).json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (err) {
    console.error('getFarmerMyListings error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load farmer crop listings.' });
  }
}

module.exports = {
  getCropListings,
  getCropListingById,
  createCropListing,
  updateCropListing,
  deleteCropListing,
  createCropEnquiry,
  getFarmerEnquiries,
  getBuyerEnquiries,
  getFarmerMyListings,
  updateEnquiryStatus,
};
