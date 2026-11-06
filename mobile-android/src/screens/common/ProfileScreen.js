// FarmConnect Comprehensive Profile & Account Management Screen (All 4 Roles)
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { Card, Badge, Button, Input, Header } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export default function ProfileScreen({ onBack }) {
  const { user, updateProfile, logout, isLoading } = useAuth();
  const { showSuccess, showError } = useNotification();
  const profile = user?.profile || {};

  // Common Fields
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Farmer Specific Fields
  const [district, setDistrict] = useState(profile.district || 'Mandya');
  const [village, setVillage] = useState(profile.village || 'Kyathumgere');
  const [crops, setCrops] = useState(profile.primary_crops || 'Sugarcane, Paddy, Ragi');
  const [landSize, setLandSize] = useState(String(profile.land_size_acres || '8.5'));
  const [soilType, setSoilType] = useState(profile.soil_type || 'Red Sandy Loam');

  // Buyer Specific Fields
  const [businessName, setBusinessName] = useState(profile.business_name || 'Kiran Wholesales Mandya');
  const [buyerType, setBuyerType] = useState(profile.buyer_type || 'Licensed APMC Wholesaler & Grain Stockist');
  const [deliveryAddress, setDeliveryAddress] = useState(
    profile.delivery_address || 'Shop #12, APMC Market Yard, Maddur Road, Mandya, Karnataka - 571401'
  );
  const [gstNumber, setGstNumber] = useState(profile.gst_number || '29ABCDE1234F1Z5');

  // Seller Specific Fields
  const [shopName, setShopName] = useState(profile.shop_name || 'Cauvery Agri Input Centre & Seed Depot');
  const [licenseNumber, setLicenseNumber] = useState(profile.license_number || 'KA-AGRI-RET-MDY-2024-8841');
  const [storeAddress, setStoreAddress] = useState(
    profile.store_address || 'Shop #4, Near APMC Main Gate, Mandya Industrial Estate, Mandya - 571401'
  );
  const [gstin, setGstin] = useState(profile.gstin || '29AABCC5678F1ZT');

  // Admin Specific Fields
  const [designation, setDesignation] = useState(profile.designation || 'Chief Compliance & Operations Director');
  const [department, setDepartment] = useState(profile.department || 'Karnataka State Agricultural Marketing Board');
  const [officeAddress, setOfficeAddress] = useState(
    profile.office_address || 'Krishi Bhavan, 4th Floor, Hudson Circle, Bengaluru, Karnataka - 560001'
  );

  const handleSave = async () => {
    let profileData = {};

    if (user?.role === 'FARMER') {
      profileData = {
        district,
        village,
        primary_crops: crops,
        land_size_acres: parseFloat(landSize) || 0,
        soil_type: soilType,
      };
    } else if (user?.role === 'BUYER') {
      profileData = {
        business_name: businessName,
        buyer_type: buyerType,
        delivery_address: deliveryAddress,
        gst_number: gstNumber,
      };
    } else if (user?.role === 'SELLER') {
      profileData = {
        shop_name: shopName,
        license_number: licenseNumber,
        store_address: storeAddress,
        gstin,
      };
    } else if (user?.role === 'ADMIN') {
      profileData = {
        designation,
        department,
        office_address: officeAddress,
      };
    }

    const res = await updateProfile({
      name,
      phone,
      profileData,
    });

    if (res.success) {
      showSuccess('Profile details saved to SQLite database!', 'Profile Updated');
    } else {
      showError(res.message, 'Update Failed');
    }
  };

  const getRoleVariant = (role) => {
    if (role === 'FARMER') return 'farmer';
    if (role === 'BUYER') return 'buyer';
    if (role === 'SELLER') return 'seller';
    if (role === 'ADMIN') return 'admin';
    return 'default';
  };

  return (
    <View style={styles.container}>
      <Header
        title="Profile & Professional Dossier"
        subtitle={user?.email}
        onBack={onBack}
        rightAction={<Badge label={user?.role || 'USER'} variant={getRoleVariant(user?.role)} />}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Identity & Verified Credentials Card */}
        <Card style={styles.card}>
          <Text style={styles.title}>Account Identity</Text>
          <Text style={styles.sub}>Verified FarmConnect identity stored permanently in SQLite</Text>

          <Input label="Full Name / Authorized Signatory" value={name} onChangeText={setName} />
          <Input label="Official Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Input
            label="Email Address (Permanent)"
            value={user?.email || ''}
            editable={false}
            helperText="Permanent system identification handle"
          />
        </Card>

        {/* Role Specific Details Card */}
        {user?.role === 'FARMER' && (
          <Card style={[styles.card, { marginTop: spacing.md }]}>
            <Text style={styles.title}>🌾 Agricultural Field Details</Text>
            <Text style={styles.sub}>Agronomic telemetry and landholding credentials</Text>

            <Input label="District" value={district} onChangeText={setDistrict} />
            <Input label="Village" value={village} onChangeText={setVillage} />
            <Input label="Cultivable Land Size (Acres)" value={landSize} onChangeText={setLandSize} keyboardType="numeric" />
            <Input label="Soil Type" value={soilType} onChangeText={setSoilType} />
            <Input label="Primary Crops" value={crops} onChangeText={setCrops} />
          </Card>
        )}

        {user?.role === 'BUYER' && (
          <Card style={[styles.card, { marginTop: spacing.md }]}>
            <Text style={styles.title}>🏢 Procurement Hub & Trade License</Text>
            <Text style={styles.sub}>Wholesale stockist & commercial trade credentials</Text>

            <Input label="Registered Business / Firm Name" value={businessName} onChangeText={setBusinessName} />
            <Input label="Trade Category / Buyer Type" value={buyerType} onChangeText={setBuyerType} />
            <Input label="GSTIN / Mandi Stockist License" value={gstNumber} onChangeText={setGstNumber} />
            <Input
              label="Primary Delivery Yard & Warehouse Address"
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              multiline
              numberOfLines={3}
            />
          </Card>
        )}

        {user?.role === 'SELLER' && (
          <Card style={[styles.card, { marginTop: spacing.md }]}>
            <Text style={styles.title}>🏪 Merchant Storefront & Dealer Credentials</Text>
            <Text style={styles.sub}>Official agricultural input retailing & dealership licenses</Text>

            <Input label="Store / Dealership Name" value={shopName} onChangeText={setShopName} />
            <Input label="Agriculture Input License No." value={licenseNumber} onChangeText={setLicenseNumber} />
            <Input label="Commercial GSTIN" value={gstin} onChangeText={setGstin} />
            <Input
              label="Storefront & Central Depot Address"
              value={storeAddress}
              onChangeText={setStoreAddress}
              multiline
              numberOfLines={3}
            />
          </Card>
        )}

        {user?.role === 'ADMIN' && (
          <Card style={[styles.card, { marginTop: spacing.md }]}>
            <Text style={styles.title}>🛡️ Platform Administration & Jurisdiction</Text>
            <Text style={styles.sub}>Statutory agricultural marketing governance authority</Text>

            <Input label="Officer Designation" value={designation} onChangeText={setDesignation} />
            <Input label="Controlling Department" value={department} onChangeText={setDepartment} />
            <Input
              label="State Headquarters Address"
              value={officeAddress}
              onChangeText={setOfficeAddress}
              multiline
              numberOfLines={3}
            />
          </Card>
        )}

        <Button
          title="Save Profile Changes"
          onPress={handleSave}
          loading={isLoading}
          variant="primary"
          size="md"
          style={styles.saveBtn}
        />

        {/* Security & Logout Card */}
        <Card style={styles.logoutCard}>
          <Text style={styles.logoutTitle}>Security & Session</Text>
          <Text style={styles.logoutSub}>Sign out of this device. Your data remains stored safely in SQLite.</Text>
          <Button title="Log Out of FarmConnect" variant="danger" size="md" onPress={logout} />
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  card: {
    padding: spacing.md,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  sub: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  saveBtn: {
    marginTop: spacing.md,
  },
  logoutCard: {
    padding: spacing.md,
    marginTop: spacing.md,
    borderColor: colors.error,
    borderWidth: 1,
  },
  logoutTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.error,
  },
  logoutSub: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
});
