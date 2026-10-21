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
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Book, ReadingNote } from '../types';
import { COLORS } from '../theme/colors';

interface QuickNoteModalProps {
  visible: boolean;
  activeBook: Book | null;
  books: Book[];
  existingNote?: ReadingNote | null;
  onClose: () => void;
  onSaveNote: (note: {
    bookId: string;
    bookTitle: string;
    bookAuthor: string;
    pageNumber: number;
    quote?: string;
    thought: string;
    isSerif?: boolean;
  }) => void;
}

export const QuickNoteModal: React.FC<QuickNoteModalProps> = ({
  visible,
  activeBook,
  books,
  existingNote,
  onClose,
  onSaveNote,
}) => {
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [pageNumber, setPageNumber] = useState<string>('1');
  const [quote, setQuote] = useState<string>('');
  const [thought, setThought] = useState<string>('');
  const [isSerif, setIsSerif] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (existingNote) {
      setSelectedBookId(existingNote.bookId);
      setPageNumber(String(existingNote.pageNumber));
      setQuote(existingNote.quote || '');
      setThought(existingNote.thought);
      setIsSerif(!!existingNote.isSerif);
    } else if (activeBook) {
      setSelectedBookId(activeBook.id);
      setPageNumber(String(activeBook.currentPage || 1));
      setQuote('');
      setThought('');
      setIsSerif(true);
    } else if (books.length > 0) {
      setSelectedBookId(books[0].id);
      setPageNumber('1');
      setQuote('');
      setThought('');
      setIsSerif(true);
    }
    setError('');
  }, [visible, existingNote, activeBook, books]);

  const targetBook = books.find((b) => b.id === selectedBookId) || activeBook || books[0];

  const handleSave = () => {
    if (!targetBook) {
      setError('Please select a book first');
      return;
    }
    if (!thought.trim() && !quote.trim()) {
      setError('Please add a thought or quote to save');
      return;
    }

    const page = Math.max(1, parseInt(pageNumber, 10) || 1);

    onSaveNote({
      bookId: targetBook.id,
      bookTitle: targetBook.title,
      bookAuthor: targetBook.author,
      pageNumber: page,
      quote: quote.trim() || undefined,
      thought: thought.trim(),
      isSerif,
    });

    onClose();
  };

  const textStyleByFont = {
    fontFamily: isSerif ? (Platform.OS === 'ios' ? 'Georgia' : 'serif') : undefined,
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>
                {existingNote ? 'Edit Reading Note' : 'Quick Reading Note'}
              </Text>
              <Text style={styles.headerSubtitle}>
                {targetBook ? targetBook.title : 'Capture thoughts without breaking focus'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            {/* Book Selector if multiple books and no active book locked */}
            {books.length > 1 && !activeBook && (
              <View style={styles.bookSelectSection}>
                <Text style={styles.label}>Select Book</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bookPills}>
                  {books.map((b) => {
                    const isSelected = b.id === selectedBookId;
                    return (
                      <TouchableOpacity
                        key={b.id}
                        style={[styles.bookPill, isSelected && styles.bookPillActive]}
                        onPress={() => setSelectedBookId(b.id)}
                      >
                        <Text style={[styles.bookPillText, isSelected && styles.bookPillTextActive]}>
                          {b.title}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Typography Toggle & Page Row */}
            <View style={styles.controlsRow}>
              <View style={styles.pageBox}>
                <Text style={styles.label}>Page #</Text>
                <TextInput
                  style={styles.pageInput}
                  keyboardType="number-pad"
                  value={pageNumber}
                  onChangeText={setPageNumber}
                />
              </View>

              {/* Serif Font Toggle as specified */}
              <TouchableOpacity
                style={[styles.fontToggleBtn, isSerif && styles.fontToggleBtnActive]}
                onPress={() => setIsSerif(!isSerif)}
                activeOpacity={0.8}
              >
                <Feather
                  name="type"
                  size={16}
                  color={isSerif ? COLORS.accent : COLORS.textSecondary}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.fontToggleText, isSerif && styles.fontToggleTextActive]}>
                  {isSerif ? 'Serif Font (Active)' : 'Sans-Serif Font'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Quote Input */}
            <View style={styles.inputSection}>
              <View style={styles.inputHeader}>
                <Text style={styles.label}>Notable Quote (Optional)</Text>
                <Feather name="bookmark" size={14} color={COLORS.accent} />
              </View>
              <TextInput
                style={[styles.quoteInput, textStyleByFont]}
                placeholder="“Highlight a line or passage that resonated...”"
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={3}
                value={quote}
                onChangeText={setQuote}
              />
            </View>

            {/* Reflection / Thought Input */}
            <View style={styles.inputSection}>
              <View style={styles.inputHeader}>
                <Text style={styles.label}>Your Thought / Reflection</Text>
                <Feather name="message-square" size={14} color={COLORS.textSecondary} />
              </View>
              <TextInput
                style={[styles.thoughtInput, textStyleByFont]}
                placeholder="What does this spark? How will you apply this insight?"
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={5}
                value={thought}
                onChangeText={setThought}
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Feather name="check" size={18} color={COLORS.textInverse} style={{ marginRight: 6 }} />
              <Text style={styles.saveBtnText}>Save Reading Note</Text>
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
    fontSize: 19,
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
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    marginBottom: 10,
    fontWeight: '600',
  },
  bookSelectSection: {
    marginBottom: 14,
  },
  bookPills: {
    flexDirection: 'row',
    marginTop: 6,
  },
  bookPill: {
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    marginRight: 8,
  },
  bookPillActive: {
    backgroundColor: COLORS.accentDim,
    borderColor: COLORS.accent,
  },
  bookPillText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  bookPillTextActive: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  pageBox: {
    flex: 1,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  pageInput: {
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  fontToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  fontToggleBtnActive: {
    backgroundColor: COLORS.accentDim,
    borderColor: COLORS.accent,
  },
  fontToggleText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  fontToggleTextActive: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  inputSection: {
    marginBottom: 16,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quoteInput: {
    backgroundColor: COLORS.surfaceElevated,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    color: COLORS.textPrimary,
    fontSize: 15,
    fontStyle: 'italic',
    minHeight: 70,
    textAlignVertical: 'top',
  },
  thoughtInput: {
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    color: COLORS.textPrimary,
    fontSize: 15,
    minHeight: 110,
    textAlignVertical: 'top',
  },
  saveBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  saveBtnText: {
    color: COLORS.textInverse,
    fontSize: 15,
    fontWeight: '700',
  },
});
