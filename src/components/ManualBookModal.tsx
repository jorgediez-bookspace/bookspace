import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BookShelf } from '../types';
import { COLORS } from '../theme/colors';

interface ManualBookModalProps {
  visible: boolean;
  onClose: () => void;
  onAddBook: (book: {
    title: string;
    author: string;
    coverUrl?: string;
    totalPages: number;
    currentPage: number;
    shelf: BookShelf;
  }) => void;
}

export const ManualBookModal: React.FC<ManualBookModalProps> = ({
  visible,
  onClose,
  onAddBook,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalPages, setTotalPages] = useState('300');
  const [currentPage, setCurrentPage] = useState('0');
  const [coverUrl, setCoverUrl] = useState('');
  const [shelf, setShelf] = useState<BookShelf>('reading');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) {
      setError('Please enter a book title');
      return;
    }
    if (!author.trim()) {
      setError('Please enter an author name');
      return;
    }

    const total = Math.max(1, parseInt(totalPages, 10) || 300);
    const curr = Math.min(total, Math.max(0, parseInt(currentPage, 10) || 0));

    onAddBook({
      title: title.trim(),
      author: author.trim(),
      coverUrl: coverUrl.trim() || undefined,
      totalPages: total,
      currentPage: shelf === 'finished' ? total : curr,
      shelf,
    });

    // Reset
    setTitle('');
    setAuthor('');
    setTotalPages('300');
    setCurrentPage('0');
    setCoverUrl('');
    setShelf('reading');
    setError('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.sheetContainer}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Manual Book Entry</Text>
              <Text style={styles.headerSubtitle}>For indie, rare, or offline reading</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            {/* Title */}
            <Text style={styles.label}>Book Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Sapiens: A Brief History"
              placeholderTextColor={COLORS.textMuted}
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                setError('');
              }}
            />

            {/* Author */}
            <Text style={styles.label}>Author *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Yuval Noah Harari"
              placeholderTextColor={COLORS.textMuted}
              value={author}
              onChangeText={(text) => {
                setAuthor(text);
                setError('');
              }}
            />

            {/* Shelf */}
            <Text style={styles.label}>Shelf</Text>
            <View style={styles.shelfRow}>
              {(['reading', 'want_to_read', 'finished'] as BookShelf[]).map((s) => {
                const active = shelf === s;
                const label =
                  s === 'reading'
                    ? 'Currently Reading'
                    : s === 'want_to_read'
                    ? 'Want to Read'
                    : 'Finished';
                return (
                  <TouchableOpacity
                    key={s}
                    style={[styles.shelfBtn, active && styles.shelfBtnActive]}
                    onPress={() => setShelf(s)}
                  >
                    <Text style={[styles.shelfBtnText, active && styles.shelfBtnTextActive]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Pages Row */}
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>Total Pages</Text>
                <TextInput
                  style={styles.input}
                  placeholder="300"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                  value={totalPages}
                  onChangeText={setTotalPages}
                />
              </View>
              {shelf !== 'want_to_read' && (
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.label}>Current Page</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="number-pad"
                    value={currentPage}
                    onChangeText={setCurrentPage}
                  />
                </View>
              )}
            </View>

            {/* Cover URL */}
            <Text style={styles.label}>Cover Image URL (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="https://example.com/cover.jpg"
              placeholderTextColor={COLORS.textMuted}
              value={coverUrl}
              onChangeText={setCoverUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitBtnText}>Save to Library</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
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
    maxHeight: '90%',
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
    marginBottom: 16,
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
  },
  closeBtn: {
    padding: 6,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    marginBottom: 12,
    fontWeight: '600',
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shelfRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  shelfBtn: {
    flex: 1,
    backgroundColor: COLORS.surfaceElevated,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  shelfBtnActive: {
    backgroundColor: COLORS.accentDim,
    borderColor: COLORS.accent,
  },
  shelfBtnText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  shelfBtnTextActive: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  submitBtnText: {
    color: COLORS.textInverse,
    fontSize: 15,
    fontWeight: '700',
  },
});
