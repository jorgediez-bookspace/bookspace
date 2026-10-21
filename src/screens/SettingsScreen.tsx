import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useBooks } from '../context/BookContext';
import { AvatarPickerModal, PRESET_AVATARS } from '../components/AvatarPickerModal';
import { COLORS } from '../theme/colors';

export const SettingsScreen: React.FC = () => {
  const { user, updateProfile, logout, deleteAccount } = useAuth();
  const { books, notes } = useBooks();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.displayName || '');
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Quick stats
  const totalBooks = books.length;
  const finishedBooks = books.filter((b) => b.shelf === 'finished').length;
  const totalNotes = notes.length;
  const totalPagesRead = books.reduce((acc, b) => acc + (b.currentPage || 0), 0);

  const handleSaveName = async () => {
    if (nameInput.trim()) {
      await updateProfile({ displayName: nameInput.trim() });
      setIsEditingName(false);
    }
  };

  const handleSignOut = () => {
    const confirmMsg = 'Are you sure you want to sign out of BookSpace?';
    if (Platform.OS === 'web') {
      if (window.confirm(confirmMsg)) {
        logout();
      }
    } else {
      Alert.alert('Sign Out', confirmMsg, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'default', onPress: logout },
      ]);
    }
  };

  const handleDeleteAccountConfirm = async () => {
    await deleteAccount();
    setIsDeleteModalOpen(false);
  };

  const currentPreset = PRESET_AVATARS.find((p) => p.id === user?.avatarPresetId) || PRESET_AVATARS[0];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Settings</Text>
        <Text style={styles.screenSubtitle}>BookSpace account & reader preferences</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={() => setIsAvatarModalOpen(true)}
            activeOpacity={0.8}
          >
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatarPresetCircle, { backgroundColor: currentPreset.bg }]}>
                <Feather name={currentPreset.icon as any} size={28} color="#FFFFFF" />
              </View>
            )}
            <View style={styles.avatarEditBadge}>
              <Feather name="camera" size={12} color={COLORS.textInverse} />
            </View>
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            {isEditingName ? (
              <View style={styles.nameEditRow}>
                <TextInput
                  style={styles.nameInput}
                  value={nameInput}
                  onChangeText={setNameInput}
                  autoFocus
                />
                <TouchableOpacity style={styles.nameSaveBtn} onPress={handleSaveName}>
                  <Feather name="check" size={16} color={COLORS.textInverse} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.nameDisplayRow}
                onPress={() => {
                  setNameInput(user?.displayName || '');
                  setIsEditingName(true);
                }}
              >
                <Text style={styles.displayName}>{user?.displayName || 'Reader'}</Text>
                <Feather name="edit-2" size={14} color={COLORS.accent} style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            )}
            <Text style={styles.emailText}>{user?.email}</Text>
          </View>
        </View>

        {/* Reading Statistics Overview */}
        <Text style={styles.sectionHeader}>READING STATISTICS</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalBooks}</Text>
            <Text style={styles.statLabel}>Total Books</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: COLORS.shelfFinished }]}>{finishedBooks}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: COLORS.accent }]}>{totalPagesRead}</Text>
            <Text style={styles.statLabel}>Pages Read</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalNotes}</Text>
            <Text style={styles.statLabel}>Notes & Quotes</Text>
          </View>
        </View>

        {/* App Information */}
        <Text style={styles.sectionHeader}>APP INFORMATION</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App Name</Text>
            <Text style={styles.infoValue}>BookSpace</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0 (OLED Minimalist)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Active Theme</Text>
            <Text style={[styles.infoValue, { color: COLORS.accent }]}>Pure OLED Black (#000000)</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Live Book API</Text>
            <Text style={styles.infoValue}>Open Library & Google Books</Text>
          </View>
        </View>

        {/* Account Actions */}
        <Text style={styles.sectionHeader}>ACCOUNT ACTIONS</Text>
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
          <Feather name="log-out" size={16} color={COLORS.textPrimary} style={{ marginRight: 8 }} />
          <Text style={styles.signOutBtnText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Danger Zone */}
        <Text style={[styles.sectionHeader, { color: COLORS.danger, marginTop: 24 }]}>
          DANGER ZONE
        </Text>
        <View style={styles.dangerCard}>
          <View style={styles.dangerContent}>
            <Feather name="alert-triangle" size={18} color={COLORS.danger} style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.dangerTitle}>Delete Account</Text>
              <Text style={styles.dangerSubtitle}>
                Permanently erase your account, library, reading notes, and session history.
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.deleteAccountBtn}
            onPress={() => setIsDeleteModalOpen(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteAccountBtnText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Avatar Picker Modal */}
      <AvatarPickerModal
        visible={isAvatarModalOpen}
        currentAvatarUrl={user?.avatarUrl}
        currentPresetId={user?.avatarPresetId}
        onClose={() => setIsAvatarModalOpen(false)}
        onSelectAvatar={async (data) => {
          await updateProfile(data);
        }}
      />

      {/* Delete Account Confirmation Modal */}
      {isDeleteModalOpen && (
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalCard}>
            <View style={styles.deleteWarningIcon}>
              <Feather name="alert-octagon" size={32} color={COLORS.danger} />
            </View>
            <Text style={styles.deleteModalTitle}>Permanently Delete Account?</Text>
            <Text style={styles.deleteModalMessage}>
              This action cannot be undone. All your books, reading progress, and captured quotes
              will be permanently erased from this device.
            </Text>
            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={styles.deleteCancelBtn}
                onPress={() => setIsDeleteModalOpen(false)}
              >
                <Text style={styles.deleteCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteConfirmBtn}
                onPress={handleDeleteAccountConfirm}
              >
                <Text style={styles.deleteConfirmBtnText}>Yes, Delete Everything</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  header: {
    marginBottom: 16,
  },
  screenTitle: {
    color: COLORS.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  screenSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 22,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 16,
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  avatarPresetCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.accent,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  profileInfo: {
    flex: 1,
  },
  nameDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  displayName: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  nameEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameInput: {
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  nameSaveBtn: {
    backgroundColor: COLORS.accent,
    padding: 8,
    borderRadius: 8,
  },
  emailText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  sectionHeader: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  statValue: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  infoValue: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  signOutBtnText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  dangerCard: {
    backgroundColor: '#150A0A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
    padding: 16,
  },
  dangerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  dangerTitle: {
    color: COLORS.danger,
    fontSize: 15,
    fontWeight: '700',
  },
  dangerSubtitle: {
    color: '#B09090',
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  deleteAccountBtn: {
    backgroundColor: COLORS.danger,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteAccountBtnText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  deleteModalOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 999,
  },
  deleteModalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.danger,
    padding: 22,
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
  },
  deleteWarningIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.dangerDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  deleteModalTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  deleteModalMessage: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  deleteCancelBtn: {
    flex: 1,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteCancelBtnText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  deleteConfirmBtn: {
    flex: 1.4,
    backgroundColor: COLORS.danger,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteConfirmBtnText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
});
