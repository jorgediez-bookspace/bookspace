import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Book } from '../types';
import { COLORS } from '../theme/colors';

interface UpdatePageModalProps {
  visible: boolean;
  book: Book | null;
  onClose: () => void;
  onSavePage: (bookId: string, newPage: number) => void;
}

export const UpdatePageModal: React.FC<UpdatePageModalProps> = ({
  visible,
  book,
  onClose,
  onSavePage,
}) => {
  const [page, setPage] = useState('0');

  useEffect(() => {
    if (book) {
      setPage(String(book.currentPage));
    }
  }, [book, visible]);

  if (!book) return null;

  const pageNum = parseInt(page, 10) || 0;
  const clamped = Math.max(0, Math.min(book.totalPages, pageNum));
  const percent = Math.min(100, Math.round((clamped / Math.max(1, book.totalPages)) * 100));
  const isComplete = clamped >= book.totalPages;

  const adjustPage = (delta: number) => {
    const next = Math.max(0, Math.min(book.totalPages, clamped + delta));
    setPage(String(next));
  };

  const handleSave = () => {
    onSavePage(book.id, clamped);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.cardContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Update Reading Progress</Text>
              <Text style={styles.bookTitle} numberOfLines={1}>
                {book.title}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Large page display with stepper */}
          <View style={styles.stepperContainer}>
            <View style={styles.quickButtonsRow}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => adjustPage(-5)}>
                <Text style={styles.stepBtnText}>-5</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.stepBtn} onPress={() => adjustPage(-1)}>
                <Text style={styles.stepBtnText}>-1</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputBox}>
              <TextInput
                style={styles.pageInput}
                keyboardType="number-pad"
                value={page}
                onChangeText={setPage}
                selectTextOnFocus
              />
              <Text style={styles.totalText}>/ {book.totalPages}</Text>
            </View>

            <View style={styles.quickButtonsRow}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => adjustPage(1)}>
                <Text style={styles.stepBtnText}>+1</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.stepBtn} onPress={() => adjustPage(5)}>
                <Text style={styles.stepBtnText}>+5</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Progress bar preview */}
          <View style={styles.previewContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${percent}%` }]} />
            </View>
            <View style={styles.progressLabelRow}>
              <Text style={styles.percentText}>{percent}% completed</Text>
              {isComplete && (
                <View style={styles.finishedBadge}>
                  <Feather name="check-circle" size={12} color={COLORS.success} />
                  <Text style={styles.finishedBadgeText}>Finished!</Text>
                </View>
              )}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save Progress</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 22,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  bookTitle: {
    color: COLORS.accent,
    fontSize: 13,
    marginTop: 2,
    fontWeight: '600',
    maxWidth: 260,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickButtonsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  stepBtn: {
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pageInput: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    minWidth: 50,
    textAlign: 'center',
  },
  totalText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  previewContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#202020',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 4,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  percentText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  finishedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  finishedBadgeText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1.5,
    backgroundColor: COLORS.accent,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    color: COLORS.textInverse,
    fontSize: 14,
    fontWeight: '700',
  },
});
