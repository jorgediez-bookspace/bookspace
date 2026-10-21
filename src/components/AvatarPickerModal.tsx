import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

interface AvatarPickerModalProps {
  visible: boolean;
  currentAvatarUrl?: string;
  currentPresetId?: string;
  onClose: () => void;
  onSelectAvatar: (avatarData: { avatarUrl?: string; avatarPresetId?: string }) => void;
}

export const PRESET_AVATARS = [
  { id: 'avatar-1', label: 'Atlas', bg: '#FF6B00', icon: 'compass' },
  { id: 'avatar-2', label: 'Zenith', bg: '#1E293B', icon: 'feather' },
  { id: 'avatar-3', label: 'Nexus', bg: '#0F766E', icon: 'book' },
  { id: 'avatar-4', label: 'Solar', bg: '#D97706', icon: 'sun' },
  { id: 'avatar-5', label: 'Cosmos', bg: '#4338CA', icon: 'moon' },
  { id: 'avatar-6', label: 'Monolith', bg: '#27272A', icon: 'layers' },
];

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  visible,
  currentAvatarUrl,
  currentPresetId,
  onClose,
  onSelectAvatar,
}) => {
  const [customUrl, setCustomUrl] = useState(currentAvatarUrl || '');
  const [selectedPreset, setSelectedPreset] = useState<string>(currentPresetId || 'avatar-1');

  const handlePickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Needed',
          'Please allow camera roll access to pick a custom profile image.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedUri = result.assets[0].uri;
        onSelectAvatar({ avatarUrl: pickedUri, avatarPresetId: undefined });
        onClose();
      }
    } catch (err) {
      console.warn('[AvatarPicker] gallery picker error:', err);
      Alert.alert('Notice', 'Image picker is not supported on this preview.');
    }
  };

  const handleApplyPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    onSelectAvatar({ avatarPresetId: presetId, avatarUrl: undefined });
    onClose();
  };

  const handleApplyUrl = () => {
    if (customUrl.trim()) {
      onSelectAvatar({ avatarUrl: customUrl.trim(), avatarPresetId: undefined });
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Choose Profile Avatar</Text>
              <Text style={styles.headerSubtitle}>
                Select a minimalist geometric icon, image URL, or gallery photo
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Minimalist Geometric Presets */}
            <Text style={styles.sectionTitle}>Minimalist Geometric Presets</Text>
            <View style={styles.presetsGrid}>
              {PRESET_AVATARS.map((preset) => {
                const isSelected = selectedPreset === preset.id && !currentAvatarUrl;
                return (
                  <TouchableOpacity
                    key={preset.id}
                    style={[styles.presetCard, isSelected && styles.presetCardActive]}
                    onPress={() => handleApplyPreset(preset.id)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.presetCircle, { backgroundColor: preset.bg }]}>
                      <Feather name={preset.icon as any} size={22} color="#FFFFFF" />
                    </View>
                    <Text style={styles.presetLabel}>{preset.label}</Text>
                    {isSelected && (
                      <View style={styles.activeCheck}>
                        <Feather name="check" size={10} color={COLORS.textInverse} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Gallery Upload CTA */}
            <Text style={styles.sectionTitle}>Device Photo</Text>
            <TouchableOpacity
              style={styles.galleryBtn}
              onPress={handlePickFromGallery}
              activeOpacity={0.8}
            >
              <Feather name="image" size={18} color={COLORS.accent} style={{ marginRight: 10 }} />
              <Text style={styles.galleryBtnText}>Choose from Photo Library</Text>
            </TouchableOpacity>

            {/* Custom URL Input */}
            <Text style={styles.sectionTitle}>Or Image Web URL</Text>
            <View style={styles.urlInputRow}>
              <TextInput
                style={styles.urlInput}
                placeholder="https://example.com/photo.jpg"
                placeholderTextColor={COLORS.textMuted}
                value={customUrl}
                onChangeText={setCustomUrl}
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.applyBtn} onPress={handleApplyUrl}>
                <Text style={styles.applyBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    maxHeight: '85%',
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
    maxWidth: 280,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 10,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  presetCard: {
    width: '30.5%',
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 14,
    alignItems: 'center',
    position: 'relative',
  },
  presetCardActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentDim,
  },
  presetCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  presetLabel: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  activeCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 16,
  },
  galleryBtnText: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  urlInputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  urlInput: {
    flex: 1,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  applyBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    color: COLORS.textInverse,
    fontSize: 14,
    fontWeight: '700',
  },
});
