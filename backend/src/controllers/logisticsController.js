// FarmConnect Logistics & Shipment Tracking Controller (Phase 20)
const db = require('../config/database');
const crypto = require('crypto');

/**
 * GET /api/logistics/track/:tracking_id
 * Track shipment by tracking number or order ID
 */
function trackShipment(req, res) {
  try {
    const { tracking_id } = req.params;

    const shipment = db.prepare(`
      SELECT s.*, o.order_number, o.shipping_name, o.shipping_address, o.shipping_phone, o.total_amount
      FROM shipments s
      LEFT JOIN orders o ON s.order_id = o.id
      WHERE s.tracking_number = ? OR s.order_id = ? OR o.order_number = ?
    `).get(tracking_id, tracking_id, tracking_id);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'No active shipment tracking record found for this identifier.',
      });
    }

    let checkpoints = [];
    try {
      checkpoints = JSON.parse(shipment.checkpoints_json || '[]');
    } catch {
      checkpoints = [];
    }

    // Progression stages calculation
    const stageMap = {
      ORDER_CONFIRMED: 1,
      DISPATCHED: 2,
      IN_TRANSIT: 3,
      OUT_FOR_DELIVERY: 4,
      DELIVERED: 5,
    };

    return res.status(200).json({
      success: true,
      shipment: {
        id: shipment.id,
        order_id: shipment.order_id,
        order_number: shipment.order_number,
        tracking_number: shipment.tracking_number,
        courier_partner: shipment.courier_partner,
        vehicle_number: shipment.vehicle_number,
        driver_name: shipment.driver_name,
        driver_phone: shipment.driver_phone,
        current_location: shipment.current_location,
        status: shipment.status,
        progress_stage: stageMap[shipment.status] || 1,
        total_stages: 5,
        estimated_delivery: shipment.estimated_delivery,
        destination: {
          recipient: shipment.shipping_name,
          address: shipment.shipping_address,
          phone: shipment.shipping_phone,
        },
        timeline_checkpoints: checkpoints,
        created_at: shipment.created_at,
      },
    });
  } catch (err) {
    console.error('trackShipment error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve shipment tracking.' });
  }
}

/**
 * POST /api/logistics/dispatch
 * Create/dispatch shipment for confirmed order (Seller / Admin)
 */
function createShipment(req, res) {
  try {
    const {
      order_id,
      courier_partner = 'K-Agri Express Logistics',
      vehicle_number = 'KA-11-EA-4821',
      driver_name = 'Basavaraj M.',
      driver_phone = '9844011223',
      pickup_location = 'Cauvery Agri Warehouse, Mandya',
      delivery_days = 2,
    } = req.body;

    if (!order_id) {
      return res.status(400).json({ success: false, message: 'Order ID is required.' });
    }

    const order = db.prepare('SELECT * FROM orders WHERE id = ? OR order_number = ?').get(order_id, order_id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const existingShipment = db.prepare('SELECT id FROM shipments WHERE order_id = ?').get(order.id);
    if (existingShipment) {
      return res.status(400).json({ success: false, message: 'Shipment already exists for this order.' });
    }

    const shipmentId = 'ship_' + crypto.randomBytes(6).toString('hex');
    const trackingNumber = 'FC-TRK-' + Date.now().toString().slice(-6) + '-' + crypto.randomBytes(2).toString('hex').toUpperCase();

    const now = new Date();
    const estDeliveryDate = new Date(now.getTime() + delivery_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const initialCheckpoints = [
      {
        timestamp: now.toISOString(),
        location: pickup_location,
        title: 'Dispatched from Hub',
        description: `Consignment handed over to ${courier_partner}. Assigned vehicle: ${vehicle_number}`,
      },
    ];

    db.prepare(`
      INSERT INTO shipments (
        id, order_id, tracking_number, courier_partner, vehicle_number,
        driver_name, driver_phone, current_location, status, estimated_delivery,
        checkpoints_json, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'DISPATCHED', ?, ?, ?)
    `).run(
      shipmentId,
      order.id,
      trackingNumber,
      courier_partner,
      vehicle_number,
      driver_name,
      driver_phone,
      pickup_location,
      estDeliveryDate,
      JSON.stringify(initialCheckpoints),
      now.toISOString()
    );

    // Update Order state
    db.prepare(`
      UPDATE orders
      SET order_status = 'SHIPPED', tracking_note = ?, updated_at = ?
      WHERE id = ?
    `).run(`Shipped via ${courier_partner} (${trackingNumber})`, now.toISOString(), order.id);

    return res.status(201).json({
      success: true,
      message: 'Shipment dispatched successfully.',
      shipment_id: shipmentId,
      tracking_number: trackingNumber,
      estimated_delivery: estDeliveryDate,
    });
  } catch (err) {
    console.error('createShipment error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create shipment dispatch.' });
  }
}

/**
 * PUT /api/logistics/update-status
 * Update shipment status & append checkpoint
 */
function updateShipmentStatus(req, res) {
  try {
    const { tracking_number, status, location, notes } = req.body;

    if (!tracking_number || !status) {
      return res.status(400).json({ success: false, message: 'Tracking number and status are required.' });
    }

    const shipment = db.prepare('SELECT * FROM shipments WHERE tracking_number = ? OR id = ?').get(tracking_number, tracking_number);
    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found.' });
    }

    let checkpoints = [];
    try {
      checkpoints = JSON.parse(shipment.checkpoints_json || '[]');
    } catch {
      checkpoints = [];
    }

    const now = new Date().toISOString();
    checkpoints.push({
      timestamp: now,
      location: location || shipment.current_location,
      title: `Status updated to ${status.replace(/_/g, ' ')}`,
      description: notes || `Transit status recorded at ${location || shipment.current_location}`,
    });

    db.prepare(`
      UPDATE shipments
      SET status = ?, current_location = ?, checkpoints_json = ?
      WHERE id = ?
    `).run(status, location || shipment.current_location, JSON.stringify(checkpoints), shipment.id);

    // If delivered, update order status
    if (status === 'DELIVERED') {
      db.prepare(`
        UPDATE orders
        SET order_status = 'DELIVERED', updated_at = ?
        WHERE id = ?
      `).run(now, shipment.order_id);
    }

    return res.status(200).json({
      success: true,
      message: `Shipment status updated to ${status}`,
      tracking_number: shipment.tracking_number,
      status,
    });
  } catch (err) {
    console.error('updateShipmentStatus error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update shipment status.' });
  }
}

module.exports = {
  trackShipment,
  createShipment,
  updateShipmentStatus,
};
