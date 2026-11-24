// FarmConnect Centralized Admin Governance & Oversight Console
// Phase 6 Complete Implementation: Multi-role governance, KYC verification, dispute resolution, audit trail

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { Card, Badge, Button, Header, LoadingIndicator, EmptyState } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { apiClient } from '../../services/apiClient';

export default function AdminDashboardScreen({ onOpenProfile }) {
  const { user, logout } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'sellers' | 'users' | 'complaints' | 'audit' | 'compliance'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Telemetry & Data States
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [complianceReport, setComplianceReport] = useState(null);

  // Broadcast Alert Modal
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('Urgent: Heavy Rainfall Alert & Pest Precautions');
  const [broadcastMessage, setBroadcastMessage] = useState('IMD alerts heavy unseasonal downpours across Mandya & Maddur blocks. Safeguard standing harvest and delay chemical spraying.');
  const [broadcastSeverity, setBroadcastSeverity] = useState('WARNING');
  const [broadcastType, setBroadcastType] = useState('WEATHER');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Filters & Search
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userSearch, setUserSearch] = useState('');

  // Complaint Resolution Modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  useEffect(() => {
    loadAllAdminData();
  }, []);

  async function loadAllAdminData() {
    setLoading(true);
    try {
      const [dashRes, usersRes, sellersRes, complaintsRes, auditRes, mspRes] = await Promise.all([
        apiClient.get('/admin/dashboard').catch(() => ({ data: { data: { summary: {} } } })),
        apiClient.get('/admin/users').catch(() => ({ data: { data: [] } })),
        apiClient.get('/admin/sellers').catch(() => ({ data: { data: [] } })),
        apiClient.get('/admin/complaints').catch(() => ({ data: { data: [] } })),
        apiClient.get('/admin/audit-logs').catch(() => ({ data: { data: [] } })),
        apiClient.get('/admin/msp-compliance').catch(() => ({ data: { data: null } })),
      ]);

      if (dashRes?.data?.data?.summary) {
        setSummary(dashRes.data.data.summary);
      }
      setUsers(usersRes?.data?.data || []);
      setSellers(sellersRes?.data?.data || []);
      setComplaints(complaintsRes?.data?.data || []);
      setAuditLogs(auditRes?.data?.data || []);
      const mData = mspRes?.data || mspRes;
      if (mData?.success) {
        setComplianceReport(mData);
      }
    } catch (err) {
      showError('Failed to load administrative console data.', 'Network Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleBroadcastAlert() {
    if (!broadcastTitle || !broadcastMessage) {
      showError('Alert headline and content are required.', 'Missing Info');
      return;
    }
    setIsBroadcasting(true);
    try {
      const res = await apiClient.post('/admin/broadcast-alert', {
        title: broadcastTitle,
        message: broadcastMessage,
        severity: broadcastSeverity,
        type: broadcastType,
      });
      const data = res.data || res;
      if (data?.success || res.success) {
        showSuccess(data?.message || 'Emergency alert broadcasted to all farmers!', 'Broadcast Dispatched');
        setShowBroadcastModal(false);
        await loadAllAdminData();
      } else {
        showError(data?.message || res.message || 'Failed to dispatch alert', 'Error');
      }
    } catch (err) {
      showError(err.message, 'Network Error');
    } finally {
      setIsBroadcasting(false);
    }
  }

  // Seller KYC Actions
  async function handleVerifySeller(sellerId, newStatus) {
    try {
      setSubmittingAction(true);
      const res = await apiClient.put(`/admin/sellers/${sellerId}/verify`, {
        status: newStatus,
        notes: `Admin reviewed on ${new Date().toLocaleDateString()}`,
      });
      if (res.data?.success) {
        showSuccess(`Seller marked as ${newStatus}`, 'KYC Updated');
        // Update local state
        setSellers((prev) =>
          prev.map((s) => (s.id === sellerId ? { ...s, verification_status: newStatus } : s))
        );
        loadAllAdminData();
      }
    } catch (err) {
      showError(err.message || 'Failed to update seller verification status.', 'KYC Error');
    } finally {
      setSubmittingAction(false);
    }
  }

  // User Suspension / Reactivation
  async function handleToggleUserStatus(userId, currentStatus) {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      setSubmittingAction(true);
      const res = await apiClient.put(`/admin/users/${userId}/status`, { status: nextStatus });
      if (res.data?.success) {
        showSuccess(`User account set to ${nextStatus}`, 'Account Updated');
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
        );
      }
    } catch (err) {
      showError(err.message || 'Failed to update user status.', 'Governance Error');
    } finally {
      setSubmittingAction(false);
    }
  }

  // Complaint Resolution
  async function handleResolveComplaint(complaintId, status) {
    try {
      setSubmittingAction(true);
      const res = await apiClient.put(`/admin/complaints/${complaintId}`, {
        status,
        resolution_notes: resolutionNotes || 'Administrative resolution recorded.',
      });
      if (res.data?.success) {
        showSuccess(`Complaint #${complaintId} marked as ${status}`, 'Dispute Resolved');
        setComplaints((prev) =>
          prev.map((c) => (c.id === complaintId ? { ...c, status, resolution_notes: resolutionNotes } : c))
        );
        setSelectedComplaint(null);
        setResolutionNotes('');
        loadAllAdminData();
      }
    } catch (err) {
      showError(err.message || 'Failed to resolve complaint.', 'Dispute Error');
    } finally {
      setSubmittingAction(false);
    }
  }

  // Filtered Users List
  const filteredUsers = users.filter((u) => {
    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    const matchesSearch =
      !userSearch ||
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone.includes(userSearch) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <View style={styles.container}>
      <Header
        title="Admin Governance Console"
        subtitle={`System Administrator • ${user?.name}`}
        rightAction={<Badge label="SUPER ADMIN" variant="admin" />}
      />

      {/* Navigation Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'overview' && styles.activeTabItem]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabLabel, activeTab === 'overview' && styles.activeTabLabel]}>Overview</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'sellers' && styles.activeTabItem]}
          onPress={() => setActiveTab('sellers')}
        >
          <Text style={[styles.tabLabel, activeTab === 'sellers' && styles.activeTabLabel]}>
            KYC Queue {sellers.filter((s) => s.verification_status === 'PENDING').length > 0 && `(${sellers.filter((s) => s.verification_status === 'PENDING').length})`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'users' && styles.activeTabItem]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.tabLabel, activeTab === 'users' && styles.activeTabLabel]}>Users</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'complaints' && styles.activeTabItem]}
          onPress={() => setActiveTab('complaints')}
        >
          <Text style={[styles.tabLabel, activeTab === 'complaints' && styles.activeTabLabel]}>Disputes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'audit' && styles.activeTabItem]}
          onPress={() => setActiveTab('audit')}
        >
          <Text style={[styles.tabLabel, activeTab === 'audit' && styles.activeTabLabel]}>Audit Trail</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'compliance' && styles.activeTabItem]}
          onPress={() => setActiveTab('compliance')}
        >
          <Text style={[styles.tabLabel, activeTab === 'compliance' && styles.activeTabLabel]}>
            MSP Audit {complianceReport?.flagged_anomalies > 0 ? `(${complianceReport.flagged_anomalies})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <LoadingIndicator text="Fetching Platform Governance Telemetry..." />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* TAB 1: OVERVIEW & PLATFORM METRICS */}
          {activeTab === 'overview' && (
            <View>
              {/* Administrator Dossier Card */}
              <Card style={styles.adminDossierCard}>
                <View style={styles.dossierTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dossierTitle}>Karnataka Agricultural Marketing Board</Text>
                    <Text style={styles.dossierOfficer}>Officer: Dr. Rajeshwar Swamy (Chief Compliance Officer)</Text>
                  </View>
                  <Badge label="SUPER ADMIN" variant="admin" size="sm" />
                </View>
                <View style={styles.dossierDivider} />
                <Text style={styles.dossierMeta}>🏛️ HQ: Krishi Bhavan, Hudson Circle, Bengaluru - 560001</Text>
                <Text style={styles.dossierMeta}>📧 admin@farmconnect.org • 📞 +91 80 2234 5678</Text>
                <Text style={styles.dossierMeta}>🌐 Monitored APMC Zones: Mandya, Maddur, Mysuru, Kolar, Hubli, Raichur</Text>
                <TouchableOpacity onPress={onOpenProfile} style={{ marginTop: 6, alignItems: 'flex-end' }}>
                  <Text style={styles.dossierLink}>View Full Administration Profile →</Text>
                </TouchableOpacity>
              </Card>

              {/* Emergency Agricultural Push Dispatcher Card */}
              <Card style={styles.emergencyCard}>
                <View style={styles.emergencyHeader}>
                  <View style={{ flex: 1, marginRight: spacing.xs }}>
                    <Text style={styles.emergencyTitle}>🚨 Agricultural Emergency Push Dispatcher</Text>
                    <Text style={styles.emergencySub}>Broadcast high-priority weather warnings, pest alarms, or disaster subsidies to all farmers.</Text>
                  </View>
                  <Button
                    title="📢 Dispatch Alert"
                    variant="danger"
                    size="sm"
                    onPress={() => setShowBroadcastModal(true)}
                  />
                </View>
              </Card>

              {/* Platform Metrics Grid */}
              <View style={styles.kpiGrid}>
                <Card style={styles.kpiCard}>
                  <Text style={styles.kpiValue}>₹{summary?.totalGmv?.toLocaleString('en-IN') || 0}</Text>
                  <Text style={styles.kpiLabel}>Total Platform GMV</Text>
                </Card>

                <Card style={styles.kpiCard}>
                  <Text style={styles.kpiValue}>{summary?.totalOrders || 0}</Text>
                  <Text style={styles.kpiLabel}>Completed Orders</Text>
                </Card>

                <Card style={styles.kpiCard}>
                  <Text style={styles.kpiValue}>{summary?.totalUsers || 0}</Text>
                  <Text style={styles.kpiLabel}>Registered Users</Text>
                </Card>

                <Card style={styles.kpiCard}>
                  <Text style={[styles.kpiValue, { color: '#f59e0b' }]}>{summary?.pendingSellers || 0}</Text>
                  <Text style={styles.kpiLabel}>Pending KYCs</Text>
                </Card>
              </View>

              {/* Roles Breakdown */}
              <Card style={styles.sectionCard}>
                <Text style={styles.cardHeading}>👥 Ecosystem Participants</Text>
                <View style={styles.roleStatsRow}>
                  <View style={styles.roleStatCol}>
                    <Text style={styles.roleStatEmoji}>🌾</Text>
                    <Text style={styles.roleStatCount}>{summary?.farmerCount || 0}</Text>
                    <Text style={styles.roleStatName}>Farmers</Text>
                  </View>
                  <View style={styles.roleStatCol}>
                    <Text style={styles.roleStatEmoji}>🛒</Text>
                    <Text style={styles.roleStatCount}>{summary?.buyerCount || 0}</Text>
                    <Text style={styles.roleStatName}>Buyers</Text>
                  </View>
                  <View style={styles.roleStatCol}>
                    <Text style={styles.roleStatEmoji}>🏪</Text>
                    <Text style={styles.roleStatCount}>{summary?.sellerCount || 0}</Text>
                    <Text style={styles.roleStatName}>Sellers</Text>
                  </View>
                  <View style={styles.roleStatCol}>
                    <Text style={styles.roleStatEmoji}>🛡</Text>
                    <Text style={styles.roleStatCount}>{summary?.adminCount || 0}</Text>
                    <Text style={styles.roleStatName}>Admins</Text>
                  </View>
                </View>
              </Card>

              {/* Quick Actions */}
              <Card style={styles.sectionCard}>
                <Text style={styles.cardHeading}>⚡ Quick Operations</Text>
                <View style={styles.quickOpsRow}>
                  <Button
                    title="Review KYC Queue"
                    variant="primary"
                    size="sm"
                    onPress={() => setActiveTab('sellers')}
                    style={styles.quickOpBtn}
                  />
                  <Button
                    title="View Grievances"
                    variant="outline"
                    size="sm"
                    onPress={() => setActiveTab('complaints')}
                    style={styles.quickOpBtn}
                  />
                </View>
              </Card>

              {/* Recent Audit Activities */}
              <Card style={styles.sectionCard}>
                <Text style={styles.cardHeading}>🕒 Recent Governance Events</Text>
                {auditLogs.slice(0, 5).map((log, idx) => (
                  <View key={log.id || idx} style={styles.auditLogItem}>
                    <View style={styles.auditHeader}>
                      <Badge label={log.action} variant="neutral" />
                      <Text style={styles.auditTime}>
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    <Text style={styles.auditDetails}>{log.details}</Text>
                  </View>
                ))}
              </Card>
            </View>
          )}

          {/* TAB 2: SELLER KYC VERIFICATION QUEUE */}
          {activeTab === 'sellers' && (
            <View>
              <Text style={styles.tabSectionTitle}>Seller Verification Registry ({sellers.length})</Text>
              {sellers.length === 0 ? (
                <EmptyState title="No Sellers Found" message="All seller KYC applications have been reviewed." />
              ) : (
                sellers.map((seller) => (
                  <Card key={seller.id} style={styles.sellerCard}>
                    <View style={styles.sellerHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.sellerName}>{seller.business_name || seller.shop_name}</Text>
                        <Text style={styles.sellerOwner}>Proprietor: {seller.name} • {seller.phone}</Text>
                      </View>
                      <Badge
                        label={seller.verification_status || 'PENDING'}
                        variant={
                          seller.verification_status === 'VERIFIED'
                            ? 'success'
                            : seller.verification_status === 'REJECTED'
                            ? 'danger'
                            : 'warning'
                        }
                      />
                    </View>

                    <View style={styles.sellerDetailsBox}>
                      <Text style={styles.sellerDetailText}>
                        <Text style={styles.boldText}>License: </Text>
                        {seller.license_number || 'N/A'}
                      </Text>
                      <Text style={styles.sellerDetailText}>
                        <Text style={styles.boldText}>GSTIN: </Text>
                        {seller.gstin || 'Not registered'}
                      </Text>
                      <Text style={styles.sellerDetailText}>
                        <Text style={styles.boldText}>Registered On: </Text>
                        {new Date(seller.created_at).toLocaleDateString()}
                      </Text>
                    </View>

                    <View style={styles.actionBtnRow}>
                      <Button
                        title="Approve KYC"
                        variant="primary"
                        size="sm"
                        disabled={seller.verification_status === 'VERIFIED' || submittingAction}
                        onPress={() => handleVerifySeller(seller.id, 'VERIFIED')}
                        style={styles.flexBtn}
                      />
                      <Button
                        title="Reject KYC"
                        variant="danger"
                        size="sm"
                        disabled={seller.verification_status === 'REJECTED' || submittingAction}
                        onPress={() => handleVerifySeller(seller.id, 'REJECTED')}
                        style={styles.flexBtn}
                      />
                    </View>
                  </Card>
                ))
              )}
            </View>
          )}

          {/* TAB 3: USER GOVERNANCE DIRECTORY */}
          {activeTab === 'users' && (
            <View>
              <Text style={styles.tabSectionTitle}>User Governance Directory</Text>

              {/* Role Filter Chips */}
              <View style={styles.filterChipRow}>
                {['ALL', 'FARMER', 'BUYER', 'SELLER', 'ADMIN'].map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.filterChip, userRoleFilter === r && styles.activeFilterChip]}
                    onPress={() => setUserRoleFilter(r)}
                  >
                    <Text style={[styles.filterChipText, userRoleFilter === r && styles.activeFilterChipText]}>
                      {r}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Search Bar */}
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name, phone or email..."
                value={userSearch}
                onChangeText={setUserSearch}
                placeholderTextColor="#9ca3af"
              />

              {filteredUsers.length === 0 ? (
                <EmptyState title="No Users Found" message="Try adjusting your role filter or search criteria." />
              ) : (
                filteredUsers.map((u) => (
                  <Card key={u.id} style={styles.userCard}>
                    <View style={styles.userCardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.userName}>{u.name}</Text>
                        <Text style={styles.userContact}>{u.email} • {u.phone}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 4 }}>
                        <Badge label={u.role} variant="neutral" />
                        <Badge
                          label={u.status || 'ACTIVE'}
                          variant={u.status === 'ACTIVE' ? 'success' : 'danger'}
                        />
                      </View>
                    </View>

                    {u.role !== 'ADMIN' && (
                      <View style={{ marginTop: spacing.sm }}>
                        <Button
                          title={u.status === 'ACTIVE' ? 'Suspend Account' : 'Reactivate Account'}
                          variant={u.status === 'ACTIVE' ? 'danger' : 'outline'}
                          size="sm"
                          disabled={submittingAction}
                          onPress={() => handleToggleUserStatus(u.id, u.status)}
                        />
                      </View>
                    )}
                  </Card>
                ))
              )}
            </View>
          )}

          {/* TAB 4: COMPLAINTS & GRIEVANCE RESOLUTION */}
          {activeTab === 'complaints' && (
            <View>
              <Text style={styles.tabSectionTitle}>Grievances & Dispute Resolution</Text>
              {complaints.length === 0 ? (
                <EmptyState title="No Active Complaints" message="The grievance log is currently clear." />
              ) : (
                complaints.map((c) => (
                  <Card key={c.id} style={styles.complaintCard}>
                    <View style={styles.complaintHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.complaintSubject}>{c.subject}</Text>
                        <Text style={styles.complaintUser}>Filed by: {c.user_name} ({c.user_role})</Text>
                      </View>
                      <Badge
                        label={c.status}
                        variant={c.status === 'OPEN' ? 'warning' : c.status === 'RESOLVED' ? 'success' : 'danger'}
                      />
                    </View>

                    <Text style={styles.complaintDesc}>{c.description}</Text>

                    {c.resolution_notes && (
                      <View style={styles.resolutionBox}>
                        <Text style={styles.resolutionLabel}>Resolution Notes:</Text>
                        <Text style={styles.resolutionText}>{c.resolution_notes}</Text>
                      </View>
                    )}

                    {c.status === 'OPEN' && (
                      <View style={styles.actionBtnRow}>
                        <Button
                          title="Resolve Dispute"
                          variant="primary"
                          size="sm"
                          onPress={() => {
                            setSelectedComplaint(c);
                            setResolutionNotes('');
                          }}
                          style={styles.flexBtn}
                        />
                        <Button
                          title="Reject Grievance"
                          variant="outline"
                          size="sm"
                          onPress={() => handleResolveComplaint(c.id, 'REJECTED')}
                          style={styles.flexBtn}
                        />
                      </View>
                    )}
                  </Card>
                ))
              )}
            </View>
          )}

          {/* TAB 5: SYSTEM AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <View>
              <Text style={styles.tabSectionTitle}>Platform Audit Trail (Last 50 Events)</Text>
              {auditLogs.length === 0 ? (
                <EmptyState title="No Audit Records" message="System events will be logged here." />
              ) : (
                auditLogs.map((log) => (
                  <Card key={log.id} style={styles.auditTrailCard}>
                    <View style={styles.auditHeader}>
                      <Badge label={log.action} variant="neutral" />
                      <Text style={styles.auditTimestamp}>
                        {new Date(log.timestamp).toLocaleString()}
                      </Text>
                    </View>
                    <Text style={styles.auditActor}>
                      Actor: {log.actor_name || log.user_id || 'SYSTEM'} ({log.actor_role || 'ADMIN'})
                    </Text>
                    <Text style={styles.auditDetailsText}>{log.details}</Text>
                  </Card>
                ))
              )}
            </View>
          )}

          {/* TAB 6: MSP & APMC STATUTORY PRICE COMPLIANCE AUDIT */}
          {activeTab === 'compliance' && (
            <View>
              <Card style={styles.complianceSummaryCard}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <Text style={styles.cardHeading}>⚖️ MSP & Price Regulatory Oversight</Text>
                    <Text style={styles.complianceSub}>Real-time compliance monitoring against statutory minimum floor prices.</Text>
                  </View>
                  <Badge label={complianceReport?.compliance_rate || '100% COMPLIANT'} variant="success" size="sm" />
                </View>

                <View style={styles.kpiGrid}>
                  <Card style={styles.kpiCard}>
                    <Text style={styles.kpiValue}>{complianceReport?.total_audited || 0}</Text>
                    <Text style={styles.kpiLabel}>Audited Lots</Text>
                  </Card>
                  <Card style={styles.kpiCard}>
                    <Text style={[styles.kpiValue, { color: complianceReport?.flagged_anomalies > 0 ? '#ef4444' : '#10b981' }]}>
                      {complianceReport?.flagged_anomalies || 0}
                    </Text>
                    <Text style={styles.kpiLabel}>Flagged Anomalies</Text>
                  </Card>
                </View>
              </Card>

              <Text style={styles.tabSectionTitle}>Active Marketplace Listings & Price Audits</Text>
              {!complianceReport?.listings || complianceReport.listings.length === 0 ? (
                <EmptyState title="No Listings to Audit" message="Marketplace listings will appear here for statutory verification." />
              ) : (
                complianceReport.listings.map((item) => (
                  <Card key={item.id} style={styles.auditListingCard}>
                    <View style={styles.auditListingHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.auditCropName}>{item.crop_name} ({item.variety})</Text>
                        <Text style={styles.auditFarmer}>Farmer: {item.farmer_name} • {item.mandi_location}</Text>
                      </View>
                      <Badge
                        label={item.compliance_status === 'COMPLIANT' ? '✓ COMPLIANT' : item.compliance_status === 'BELOW_MSP_WARNING' ? '⚠️ BELOW MSP' : '🚩 HIGH CEILING'}
                        variant={item.compliance_status === 'COMPLIANT' ? 'success' : item.compliance_status === 'BELOW_MSP_WARNING' ? 'error' : 'warning'}
                        size="sm"
                      />
                    </View>

                    <View style={styles.auditPriceRow}>
                      <Text style={styles.auditExpectedPrice}>Listed: ₹{item.expected_price}/{item.unit}</Text>
                      <Text style={styles.auditMspBenchmark}>Benchmark MSP: ₹{item.official_msp}/qtl</Text>
                    </View>
                    <Text style={styles.auditNotesText}>📋 {item.notes}</Text>
                  </Card>
                ))
              )}
            </View>
          )}

          {/* Sign Out Card */}
          <Card style={styles.accountCard}>
            <Text style={styles.accountTitle}>Administrator Identity</Text>
            <Text style={styles.accountSub}>Active session: {user?.email} • Role: ADMIN</Text>
            <View style={styles.btnRow}>
              <Button title="System Settings" variant="outline" size="sm" onPress={onOpenProfile} style={styles.flexBtn} />
              <Button title="Secure Sign Out" variant="danger" size="sm" onPress={logout} style={styles.flexBtn} />
            </View>
          </Card>
        </ScrollView>
      )}

      {/* RESOLUTION MODAL */}
      <Modal visible={!!selectedComplaint} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Text style={styles.modalTitle}>Resolve Complaint #{selectedComplaint?.id}</Text>
            <Text style={styles.modalSub}>{selectedComplaint?.subject}</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Enter resolution notes, actions taken, or APMC arbitration findings..."
              multiline
              numberOfLines={4}
              value={resolutionNotes}
              onChangeText={setResolutionNotes}
              placeholderTextColor="#9ca3af"
            />

            <View style={styles.modalBtnRow}>
              <Button
                title="Cancel"
                variant="outline"
                size="sm"
                onPress={() => setSelectedComplaint(null)}
                style={styles.flexBtn}
              />
              <Button
                title="Submit Resolution"
                variant="primary"
                size="sm"
                disabled={submittingAction}
                onPress={() => handleResolveComplaint(selectedComplaint.id, 'RESOLVED')}
                style={styles.flexBtn}
              />
            </View>
          </Card>
        </View>
      </Modal>

      {/* EMERGENCY BROADCAST MODAL */}
      <Modal visible={showBroadcastModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Text style={styles.modalTitle}>📢 Broadcast Emergency Agricultural Alert</Text>
            <Text style={styles.modalSub}>
              Instantly pushes alert notifications to all registered farmers across Karnataka.
            </Text>

            <Input
              label="Alert Headline / Title"
              value={broadcastTitle}
              onChangeText={setBroadcastTitle}
            />

            <View style={{ marginBottom: spacing.xs }}>
              <Text style={styles.inputLabelSmall}>Severity Level:</Text>
              <View style={styles.pillRow}>
                {['CRITICAL', 'WARNING', 'INFO'].map((sev) => (
                  <TouchableOpacity
                    key={sev}
                    style={[styles.smallPill, broadcastSeverity === sev && styles.smallPillActive]}
                    onPress={() => setBroadcastSeverity(sev)}
                  >
                    <Text style={[styles.smallPillTxt, broadcastSeverity === sev && styles.smallPillTxtActive]}>{sev}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ marginBottom: spacing.xs }}>
              <Text style={styles.inputLabelSmall}>Category:</Text>
              <View style={styles.pillRow}>
                {['WEATHER', 'PEST', 'SCHEME'].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.smallPill, broadcastType === t && styles.smallPillActive]}
                    onPress={() => setBroadcastType(t)}
                  >
                    <Text style={[styles.smallPillTxt, broadcastType === t && styles.smallPillTxtActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Enter actionable guidance for farmers..."
              multiline
              numberOfLines={3}
              value={broadcastMessage}
              onChangeText={setBroadcastMessage}
              placeholderTextColor="#9ca3af"
            />

            <View style={styles.modalBtnRow}>
              <Button
                title="Cancel"
                variant="outline"
                size="sm"
                onPress={() => setShowBroadcastModal(false)}
                style={styles.flexBtn}
              />
              <Button
                title="Broadcast Alert"
                variant="danger"
                size="sm"
                loading={isBroadcasting}
                onPress={handleBroadcastAlert}
                style={styles.flexBtn}
              />
            </View>
          </Card>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: spacing.sm,
  },
  tabItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    marginRight: spacing.xs,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabItem: {
    borderBottomColor: '#7c3aed',
  },
  tabLabel: {
    fontSize: typography.sizes.sm,
    color: '#6b7280',
    fontWeight: typography.weights.medium,
  },
  activeTabLabel: {
    color: '#7c3aed',
    fontWeight: typography.weights.bold,
  },
  scroll: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  tabSectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: '#1f2937',
    marginBottom: spacing.sm,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  kpiCard: {
    width: '48%',
    padding: spacing.md,
    marginBottom: spacing.sm,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderLeftWidth: 4,
    borderLeftColor: '#7c3aed',
  },
  kpiValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: '#7c3aed',
  },
  kpiLabel: {
    fontSize: typography.sizes.xs,
    color: '#6b7280',
    marginTop: 2,
  },
  sectionCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeading: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: '#1f2937',
    marginBottom: spacing.sm,
  },
  roleStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
  },
  roleStatCol: {
    alignItems: 'center',
  },
  roleStatEmoji: {
    fontSize: 24,
  },
  roleStatCount: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: '#111827',
  },
  roleStatName: {
    fontSize: typography.sizes.xs,
    color: '#6b7280',
  },
  quickOpsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickOpBtn: {
    flex: 1,
  },
  auditLogItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingVertical: spacing.xs,
  },
  auditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  auditTime: {
    fontSize: typography.sizes.xs,
    color: '#9ca3af',
  },
  auditDetails: {
    fontSize: typography.sizes.xs,
    color: '#4b5563',
    marginTop: 2,
  },
  sellerCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  sellerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  sellerName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: '#111827',
  },
  sellerOwner: {
    fontSize: typography.sizes.xs,
    color: '#6b7280',
    marginTop: 2,
  },
  sellerDetailsBox: {
    backgroundColor: '#f9fafb',
    padding: spacing.sm,
    borderRadius: 6,
    marginVertical: spacing.xs,
  },
  sellerDetailText: {
    fontSize: typography.sizes.xs,
    color: '#4b5563',
    marginBottom: 2,
  },
  boldText: {
    fontWeight: typography.weights.bold,
    color: '#1f2937',
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  filterChipRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  filterChip: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
  },
  activeFilterChip: {
    backgroundColor: '#7c3aed',
  },
  filterChipText: {
    fontSize: typography.sizes.xs,
    color: '#4b5563',
    fontWeight: typography.weights.medium,
  },
  activeFilterChipText: {
    color: '#ffffff',
    fontWeight: typography.weights.bold,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.sm,
    color: '#111827',
  },
  userCard: {
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  userCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#111827',
  },
  userContact: {
    fontSize: typography.sizes.xs,
    color: '#6b7280',
    marginTop: 2,
  },
  complaintCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  complaintSubject: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#111827',
  },
  complaintUser: {
    fontSize: typography.sizes.xs,
    color: '#6b7280',
    marginTop: 2,
  },
  complaintDesc: {
    fontSize: typography.sizes.xs,
    color: '#4b5563',
    marginVertical: spacing.xs,
  },
  resolutionBox: {
    backgroundColor: '#f0fdf4',
    padding: spacing.xs,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#16a34a',
    marginVertical: spacing.xs,
  },
  resolutionLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#166534',
  },
  resolutionText: {
    fontSize: typography.sizes.xs,
    color: '#15803d',
    marginTop: 2,
  },
  auditTrailCard: {
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  auditTimestamp: {
    fontSize: typography.sizes.xs,
    color: '#9ca3af',
  },
  auditActor: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#374151',
    marginTop: 4,
  },
  auditDetailsText: {
    fontSize: typography.sizes.xs,
    color: '#4b5563',
    marginTop: 2,
  },
  accountCard: {
    padding: spacing.md,
    marginTop: spacing.md,
    backgroundColor: '#faf5ff',
    borderColor: '#e9d5ff',
    borderWidth: 1,
  },
  accountTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#6b21a8',
  },
  accountSub: {
    fontSize: typography.sizes.xs,
    color: '#7e22ce',
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  btnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flexBtn: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  modalCard: {
    padding: spacing.lg,
    backgroundColor: '#ffffff',
  },
  modalTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: '#111827',
  },
  modalSub: {
    fontSize: typography.sizes.xs,
    color: '#6b7280',
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: spacing.sm,
    fontSize: typography.sizes.sm,
    color: '#111827',
    textAlignVertical: 'top',
    marginBottom: spacing.md,
    minHeight: 100,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  adminDossierCard: {
    padding: spacing.md,
    backgroundColor: '#F3F4F6',
    borderColor: '#9CA3AF',
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  dossierTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dossierTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: '#111827',
  },
  dossierOfficer: {
    fontSize: typography.sizes.xs,
    color: '#4B5563',
    marginTop: 2,
  },
  dossierDivider: {
    height: 1,
    backgroundColor: '#D1D5DB',
    marginVertical: spacing.xs,
  },
  dossierMeta: {
    fontSize: 11,
    color: '#374151',
    marginVertical: 1,
  },
  dossierLink: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  // Emergency Card Styles
  emergencyCard: {
    padding: spacing.md,
    backgroundColor: '#FEF2F2',
    borderColor: '#F87171',
    borderWidth: 1.5,
    marginBottom: spacing.md,
  },
  emergencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emergencyTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#991B1B',
  },
  emergencySub: {
    fontSize: typography.sizes.xs,
    color: '#B91C1C',
    marginTop: 2,
  },
  // Compliance Audit Styles
  complianceSummaryCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
    borderColor: colors.primaryLight,
    borderWidth: 1.5,
  },
  complianceSub: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  auditListingCard: {
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  auditListingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  auditCropName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  auditFarmer: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  auditPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceMuted,
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
    marginVertical: spacing.xs,
  },
  auditExpectedPrice: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  auditMspBenchmark: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
    color: colors.primary,
  },
  auditNotesText: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.tight,
  },
  inputLabelSmall: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: '#374151',
    marginBottom: 4,
  },
  pillRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  smallPill: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    backgroundColor: '#F3F4F6',
    borderRadius: borderRadius.full,
  },
  smallPillActive: {
    backgroundColor: colors.primary,
  },
  smallPillTxt: {
    fontSize: 10,
    fontWeight: typography.weights.semiBold,
    color: '#4B5563',
  },
  smallPillTxtActive: {
    color: '#ffffff',
  },
});
