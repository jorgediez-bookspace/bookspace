import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { searchBooks } from '../api/booksApi';
import { SearchBookResult, BookShelf } from '../types';
import { COLORS } from '../theme/colors';

interface BookSearchModalProps {
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
  onOpenManualEntry: () => void;
}

export const BookSearchModal: React.FC<BookSearchModalProps> = ({
  visible,
  onClose,
  onAddBook,
  onOpenManualEntry,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchBookResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedBook, setSelectedBook] = useState<SearchBookResult | null>(null);
  const [selectedShelf, setSelectedShelf] = useState<BookShelf>('reading');
  const [initialPage, setInitialPage] = useState('0');

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await searchBooks(query);
      setResults(res);
      setIsSearching(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectBook = (book: SearchBookResult) => {
    setSelectedBook(book);
    setInitialPage(selectedShelf === 'finished' ? String(book.totalPages) : '0');
  };

  const handleConfirmAdd = () => {
    if (!selectedBook) return;
    const pageNum = parseInt(initialPage, 10) || 0;
    onAddBook({
      title: selectedBook.title,
      author: selectedBook.author,
      coverUrl: selectedBook.coverUrl,
      totalPages: selectedBook.totalPages,
      currentPage: Math.min(selectedBook.totalPages, Math.max(0, pageNum)),
      shelf: selectedShelf,
    });
    // Reset state & close
    setSelectedBook(null);
    setQuery('');
    setResults([]);
    onClose();
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
              <Text style={styles.headerTitle}>Add to BookSpace</Text>
              <Text style={styles.headerSubtitle}>Live search via Open Library & Google Books</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View style={styles.searchBar}>
            <Feather name="search" size={18} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input}
              placeholder="Search by title, author, or ISBN..."
              placeholderTextColor={COLORS.textMuted}
              value={query}
              onChangeText={setQuery}
              autoFocus
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Feather name="x-circle" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Fallback to manual entry banner */}
          <TouchableOpacity
            style={styles.manualEntryBanner}
            onPress={() => {
              onClose();
              onOpenManualEntry();
            }}
          >
            <Feather name="plus-circle" size={16} color={COLORS.accent} style={{ marginRight: 8 }} />
            <Text style={styles.manualEntryBannerText}>
              Can't find your book? Enter details manually
            </Text>
            <Feather name="chevron-right" size={14} color={COLORS.accent} />
          </TouchableOpacity>

          {/* Selected Book Configuration View */}
          {selectedBook ? (
            <View style={styles.configContainer}>
              <View style={styles.selectedHeader}>
                <Text style={styles.configTitle}>Confirm Book Details</Text>
                <TouchableOpacity onPress={() => setSelectedBook(null)}>
                  <Text style={styles.changeBookText}>Change</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.selectedBookCard}>
                <View style={styles.selectedCoverContainer}>
                  {selectedBook.coverUrl ? (
                    <Image source={{ uri: selectedBook.coverUrl }} style={styles.selectedCover} />
                  ) : (
                    <View style={styles.selectedCoverFallback}>
                      <Feather name="book" size={20} color={COLORS.accent} />
                    </View>
                  )}
                </View>
                <View style={styles.selectedBookInfo}>
                  <Text style={styles.selectedTitle} numberOfLines={2}>
                    {selectedBook.title}
                  </Text>
                  <Text style={styles.selectedAuthor} numberOfLines={1}>
                    {selectedBook.author}
                  </Text>
                  <Text style={styles.selectedPages}>
                    {selectedBook.totalPages} pages {selectedBook.publishedYear ? `• ${selectedBook.publishedYear}` : ''}
                  </Text>
                </View>
              </View>

              {/* Shelf Selection */}
              <Text style={styles.fieldLabel}>Select Shelf:</Text>
              <View style={styles.shelfTabs}>
                {(['reading', 'want_to_read', 'finished'] as BookShelf[]).map((shelf) => {
                  const isSelected = selectedShelf === shelf;
                  const label =
                    shelf === 'reading'
                      ? 'Currently Reading'
                      : shelf === 'want_to_read'
                      ? 'Want to Read'
                      : 'Finished';
                  return (
                    <TouchableOpacity
                      key={shelf}
                      style={[styles.shelfTab, isSelected && styles.shelfTabActive]}
                      onPress={() => {
                        setSelectedShelf(shelf);
                        if (shelf === 'finished') {
                          setInitialPage(String(selectedBook.totalPages));
                        } else if (shelf === 'want_to_read') {
                          setInitialPage('0');
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.shelfTabText,
                          isSelected && styles.shelfTabTextActive,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Initial Page Input */}
              {selectedShelf !== 'want_to_read' && (
                <View style={styles.pageInputRow}>
                  <Text style={styles.fieldLabel}>Current Page:</Text>
                  <View style={styles.pageInputContainer}>
                    <TextInput
                      style={styles.pageInput}
                      keyboardType="number-pad"
                      value={initialPage}
                      onChangeText={setInitialPage}
                    />
                    <Text style={styles.pageInputTotal}>/ {selectedBook.totalPages}</Text>
                  </View>
                </View>
              )}

              <TouchableOpacity style={styles.addConfirmBtn} onPress={handleConfirmAdd}>
                <Text style={styles.addConfirmBtnText}>Add to My Library</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Results List */
            <View style={{ flex: 1 }}>
              {isSearching ? (
                <View style={styles.centerContainer}>
                  <ActivityIndicator color={COLORS.accent} size="large" />
                  <Text style={styles.statusText}>Searching book catalogs...</Text>
                </View>
              ) : results.length > 0 ? (
                <FlatList
                  data={results}
                  keyExtractor={(item) => item.id}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.resultItem}
                      onPress={() => handleSelectBook(item)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.resultCoverContainer}>
                        {item.coverUrl ? (
                          <Image source={{ uri: item.coverUrl }} style={styles.resultCover} />
                        ) : (
                          <View style={styles.resultCoverFallback}>
                            <Feather name="book" size={16} color={COLORS.accent} />
                          </View>
                        )}
                      </View>
                      <View style={styles.resultInfo}>
                        <Text style={styles.resultTitle} numberOfLines={2}>
                          {item.title}
                        </Text>
                        <Text style={styles.resultAuthor} numberOfLines={1}>
                          {item.author}
                        </Text>
                        <Text style={styles.resultPages}>
                          {item.totalPages} pages {item.publishedYear ? `• ${item.publishedYear}` : ''}
                        </Text>
                      </View>
                      <Feather name="plus-circle" size={20} color={COLORS.accent} />
                    </TouchableOpacity>
                  )}
                />
              ) : query.length > 2 ? (
                <View style={styles.centerContainer}>
                  <Feather name="alert-circle" size={32} color={COLORS.textMuted} />
                  <Text style={styles.statusText}>No books found matching "{query}"</Text>
                  <TouchableOpacity
                    style={styles.manualBtnSmall}
                    onPress={() => {
                      onClose();
                      onOpenManualEntry();
                    }}
                  >
                    <Text style={styles.manualBtnSmallText}>Add Manually</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.centerContainer}>
                  <Feather name="book" size={36} color={COLORS.borderLight} />
                  <Text style={styles.statusText}>
                    Type a title or author above to find books instantly.
                  </Text>
                </View>
              )}
            </View>
          )}
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
    height: '88%',
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  manualEntryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentDim,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.3)',
  },
  manualEntryBannerText: {
    flex: 1,
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  statusText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  manualBtnSmall: {
    marginTop: 12,
    backgroundColor: COLORS.surfaceElevated,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  manualBtnSmallText: {
    color: COLORS.accent,
    fontWeight: '600',
    fontSize: 13,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resultCoverContainer: {
    width: 44,
    height: 64,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#1c1c1c',
  },
  resultCover: {
    width: '100%',
    height: '100%',
  },
  resultCoverFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  resultTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  resultAuthor: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  resultPages: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  configContainer: {
    flex: 1,
    paddingTop: 10,
  },
  selectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  configTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  changeBookText: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  selectedBookCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceElevated,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  selectedCoverContainer: {
    width: 56,
    height: 80,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#1e1e1e',
  },
  selectedCover: {
    width: '100%',
    height: '100%',
  },
  selectedCoverFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBookInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  selectedTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  selectedAuthor: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  selectedPages: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  fieldLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  shelfTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  shelfTab: {
    flex: 1,
    backgroundColor: COLORS.surfaceElevated,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  shelfTabActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentDim,
  },
  shelfTabText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  shelfTabTextActive: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  pageInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  pageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  pageInput: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    width: 60,
    textAlign: 'center',
  },
  pageInputTotal: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginLeft: 4,
  },
  addConfirmBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 10,
  },
  addConfirmBtnText: {
    color: COLORS.textInverse,
    fontSize: 15,
    fontWeight: '700',
  },
});
