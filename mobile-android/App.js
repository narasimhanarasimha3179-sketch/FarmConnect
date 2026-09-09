import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

// Local Wi-Fi backend endpoint (Your PC's IP)
const BACKEND_URL = 'http://10.95.149.144:5000/api/ai/diagnose';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const cameraRef = useRef(null);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.permissionText}>FarmConnect requires camera access to analyze crop diseases.</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePhotoAndDiagnose = async () => {
    if (!cameraRef.current || loading) return;

    try {
      setLoading(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.6 });

      const formData = new FormData();
      formData.append('leafImage', {
        uri: photo.uri,
        name: 'leaf_scan.jpg',
        type: 'image/jpeg',
      });

      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.diagnosis);
      } else {
        Alert.alert('Scan Failed', 'Could not process the crop leaf.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Connection Error', 'Ensure your phone and computer are on the same Wi-Fi network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {!result ? (
        <CameraView style={styles.camera} facing="back" ref={cameraRef}>
          <View style={styles.overlay}>
            <Text style={styles.overlayText}>Center crop leaf inside the target box</Text>
            <View style={styles.targetBox} />
          </View>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.captureBtn, loading && { opacity: 0.5 }]} 
              onPress={takePhotoAndDiagnose}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <View style={styles.innerCircle} />}
            </TouchableOpacity>
          </View>
        </CameraView>
      ) : (
        <ScrollView contentContainerStyle={styles.resultCard}>
          <Text style={styles.resultTitle}>Plant Diagnosis Report</Text>
          <Text style={styles.diseaseName}>{result.disease}</Text>
          <Text style={styles.severity}>Severity: {result.severity}</Text>

          <Text style={styles.sectionHeader}>Symptoms</Text>
          <Text style={styles.bodyText}>{result.symptoms}</Text>

          <Text style={styles.sectionHeader}>Organic Treatment</Text>
          <Text style={styles.bodyText}>{result.organicRemedy}</Text>

          <Text style={styles.sectionHeader}>Chemical Treatment</Text>
          <Text style={styles.bodyText}>{result.chemicalRemedy}</Text>

          <TouchableOpacity style={styles.resetButton} onPress={() => setResult(null)}>
            <Text style={styles.buttonText}>Scan Another Plant</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  permissionText: { color: '#fff', fontSize: 16, textAlign: 'center', marginBottom: 20 },
  camera: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  overlayText: { color: '#fff', fontSize: 14, marginBottom: 12, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  targetBox: { width: 260, height: 260, borderWidth: 2.5, borderColor: '#4CAF50', borderRadius: 16 },
  footer: { paddingBottom: 40, alignItems: 'center' },
  captureBtn: { width: 76, height: 76, borderRadius: 38, borderWidth: 4, borderColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  innerCircle: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#4CAF50' },
  resultCard: { padding: 28, paddingTop: 60, backgroundColor: '#fff', minHeight: '100%' },
  resultTitle: { fontSize: 24, fontWeight: '700', color: '#1B5E20', marginBottom: 8 },
  diseaseName: { fontSize: 20, fontWeight: '600', color: '#D32F2F', marginBottom: 4 },
  severity: { fontSize: 14, fontWeight: '500', color: '#666', marginBottom: 16 },
  sectionHeader: { fontSize: 16, fontWeight: '700', marginTop: 14, marginBottom: 4, color: '#222' },
  bodyText: { fontSize: 14, color: '#444', lineHeight: 20 },
  primaryButton: { backgroundColor: '#2E7D32', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  resetButton: { backgroundColor: '#2E7D32', paddingVertical: 14, borderRadius: 8, marginTop: 24, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});