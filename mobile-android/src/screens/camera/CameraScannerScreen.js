import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { aiDiagnosticService } from '../../services/aiDiagnosticService';
import { scanStorage } from '../../services/scanStorage';
import DiagnosisModal from '../../components/DiagnosisModal';

export default function CameraScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [flash, setFlash] = useState('off');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeDiagnosis, setActiveDiagnosis] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const cameraRef = useRef(null);

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryLight} />
        <Text style={styles.statusText}>Requesting camera hardware...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <View style={styles.permissionCard}>
          <Text style={styles.permissionIcon}>📷</Text>
          <Text style={styles.permissionTitle}>Camera Access Needed</Text>
          <Text style={styles.permissionDesc}>
            FarmConnect requires camera access to inspect foliage and run real-time diagnostic models on crop leaves.
          </Text>
          <TouchableOpacity
            style={styles.permissionBtn}
            onPress={requestPermission}
            activeOpacity={0.8}
          >
            <Text style={styles.permissionBtnText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const toggleFlash = () => {
    setFlash((prev) => (prev === 'off' ? 'on' : 'off'));
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  const handleCapture = async () => {
    if (!cameraRef.current || isProcessing) return;

    try {
      setIsProcessing(true);
      // Limit resolution and skip base64/heavy native processing to avoid Android memory exhaustion crashes
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.3,
        skipProcessing: true,
      });

      if (!photo?.uri) {
        throw new Error('No frame data received from sensor.');
      }

      const diagnosis = await aiDiagnosticService.diagnoseLeaf(photo.uri);
      setActiveDiagnosis(diagnosis);
      await scanStorage.saveScan(diagnosis);
      setModalVisible(true);
    } catch (err) {
      Alert.alert('Analysis Error', err.message || 'Failed to analyze foliage frame.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <CameraView
        style={styles.camera}
        facing={facing}
        enableTorch={flash === 'on'}
        ref={cameraRef}
      >
        {/* Top Header & Toggles */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={[styles.iconCircle, flash === 'on' && styles.iconCircleActive]}
            onPress={toggleFlash}
            activeOpacity={0.7}
          >
            <Text style={styles.controlIcon}>{flash === 'on' ? '⚡' : '🌩️'}</Text>
          </TouchableOpacity>
          <Text style={styles.screenHeader}>Plant Pathology Scanner</Text>
          <TouchableOpacity
            style={styles.iconCircle}
            onPress={toggleFacing}
            activeOpacity={0.7}
          >
            <Text style={styles.controlIcon}>🔄</Text>
          </TouchableOpacity>
        </View>

        {/* Viewfinder Target */}
        <View style={styles.reticleContainer}>
          <View style={styles.reticleFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text style={styles.guideText}>Center leaf lesion inside frame</Text>
        </View>

        {/* Shutter Button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.captureBtn, isProcessing && styles.captureBtnDisabled]}
            onPress={handleCapture}
            disabled={isProcessing}
            activeOpacity={0.7}
          >
            {isProcessing ? (
              <ActivityIndicator color={COLORS.primaryLight} size="small" />
            ) : (
              <View style={styles.innerCaptureBtn} />
            )}
          </TouchableOpacity>
        </View>
      </CameraView>

      <DiagnosisModal
        visible={modalVisible}
        diagnosis={activeDiagnosis}
        onClose={() => setModalVisible(false)}
        onSaveScan={() => {
          setModalVisible(false);
          Alert.alert('Scan Saved', 'Diagnostic record archived to your profile history.');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  statusText: {
    ...TYPOGRAPHY.body,
    marginTop: SPACING.md,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  permissionCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 3,
  },
  permissionIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  permissionTitle: {
    ...TYPOGRAPHY.h2,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  permissionDesc: {
    ...TYPOGRAPHY.body,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  permissionBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 12,
    paddingHorizontal: SPACING.xl,
    borderRadius: 8,
  },
  permissionBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleActive: {
    backgroundColor: 'rgba(255, 235, 59, 0.3)',
    borderWidth: 1,
    borderColor: '#ffeb3b',
  },
  controlIcon: {
    fontSize: 20,
  },
  screenHeader: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  reticleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticleFrame: {
    width: 250,
    height: 250,
    position: 'relative',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderRadius: 12,
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: COLORS.accent,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  guideText: {
    color: '#ffffff',
    marginTop: SPACING.md,
    fontSize: 13,
    fontWeight: '500',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bottomBar: {
    alignItems: 'center',
    paddingBottom: SPACING.xl * 1.5,
  },
  captureBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  captureBtnDisabled: {
    opacity: 0.5,
  },
  innerCaptureBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#ffffff',
  },
});