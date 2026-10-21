import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useBooks } from '../context/BookContext';
import { useAuth } from '../context/AuthContext';
import { Book, BookShelf } from '../types';
import { BookCard } from '../components/BookCard';
import { BookSearchModal } from '../components/BookSearchModal';
import { ManualBookModal } from '../components/ManualBookModal';
import { UpdatePageModal } from '../components/UpdatePageModal';
import { ShareModal } from '../components/ShareModal';
import { COLORS } from '../theme/colors';

interface LibraryScreenProps {
  onNavigateToFocus: (book?: Book) => void;
}

export const LibraryScreen: React.FC<LibraryScreenProps> = ({ onNavigateToFocus }) => {
  const { user } = useAuth();
  const {
    books,
    notes,
    addBook,
    updateBookPage,
    updateBookShelf,
    deleteBook,
    setActiveBook,
  } = useBooks();

  const [activeShelf, setActiveShelf] = useState<BookShelf>('reading');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [selectedBookForPage, setSelectedBookForPage] = useState<Book | null>(null);
  const [selectedBookForShare, setSelectedBookForShare] = useState<Book | null>(null);

  // Filter books by active shelf
  const filteredBooks = useMemo(() => {
    return books.filter((b) => b.shelf === activeShelf);
  }, [books, activeShelf]);

  // Shelf counters
  const counts = useMemo(() => {
    return {
      reading: books.filter((b) => b.shelf === 'reading').length,
      want_to_read: books.filter((b) => b.shelf === 'want_to_read').length,
      finished: books.filter((b) => b.shelf === 'finished').length,
    };
  }, [books]);

  const handleFocusBook = (book: Book) => {
    setActiveBook(book);
    onNavigateToFocus(book);
  };

  const handleMoveShelf = (book: Book) => {
    const nextShelf: BookShelf =
      book.shelf === 'reading'
        ? 'finished'
        : book.shelf === 'want_to_read'
        ? 'reading'
        : 'reading';

    const nextLabel =
      nextShelf === 'finished'
        ? 'Finished'
        : 'Currently Reading';

    if (Platform.OS === 'web') {
      const confirmMove = window.confirm(`Move "${book.title}" to ${nextLabel}?`);
      if (confirmMove) {
        updateBookShelf(book.id, nextShelf);
      }
    } else {
      Alert.alert(
        'Move Shelf',
        `Move "${book.title}" to ${nextLabel}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: `Move to ${nextLabel}`,
            onPress: () => updateBookShelf(book.id, nextShelf),
          },
        ]
      );
    }
  };

  const handleDeleteBook = (book: Book) => {
    const confirmMsg = `Remove "${book.title}" from your library? Associated notes will also be deleted.`;
    if (Platform.OS === 'web') {
      if (window.confirm(confirmMsg)) {
        deleteBook(book.id);
      }
    } else {
      Alert.alert('Delete Book', confirmMsg, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteBook(book.id),
        },
      ]);
    }
  };

  // Find latest note for shared book
  const latestNoteForShared = useMemo(() => {
    if (!selectedBookForShare) return null;
    return notes.find((n) => n.bookId === selectedBookForShare.id) || null;
  }, [selectedBookForShare, notes]);

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>BookSpace</Text>
          <Text style={styles.appSubtitle}>
            Welcome, {user?.displayName || 'Reader'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addBookBtn}
          onPress={() => setIsSearchOpen(true)}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={18} color={COLORS.textInverse} style={{ marginRight: 4 }} />
          <Text style={styles.addBookBtnText}>Add Book</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Search Bar trigger */}
      <TouchableOpacity
        style={styles.searchBarTrigger}
        onPress={() => setIsSearchOpen(true)}
        activeOpacity={0.7}
      >
        <Feather name="search" size={16} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
        <Text style={styles.searchBarPlaceholder}>Search books via Open Library...</Text>
      </TouchableOpacity>

      {/* Shelf Filter Pills */}
      <View style={styles.shelfFilterContainer}>
        {(['reading', 'want_to_read', 'finished'] as BookShelf[]).map((shelf) => {
          const isActive = activeShelf === shelf;
          const label =
            shelf === 'reading'
              ? 'Reading'
              : shelf === 'want_to_read'
              ? 'Want to Read'
              : 'Finished';
          const count = counts[shelf];

          return (
            <TouchableOpacity
              key={shelf}
              style={[styles.shelfPill, isActive && styles.shelfPillActive]}
              onPress={() => setActiveShelf(shelf)}
              activeOpacity={0.8}
            >
              <Text style={[styles.shelfPillText, isActive && styles.shelfPillTextActive]}>
                {label}
              </Text>
              <View style={[styles.countBadge, isActive && styles.countBadgeActive]}>
                <Text style={[styles.countBadgeText, isActive && styles.countBadgeTextActive]}>
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Books List */}
      {filteredBooks.length > 0 ? (
        <FlatList
          data={filteredBooks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <BookCard
              book={item}
              onFocus={handleFocusBook}
              onUpdatePage={(b) => setSelectedBookForPage(b)}
              onMoveShelf={handleMoveShelf}
              onShare={(b) => setSelectedBookForShare(b)}
              onDelete={handleDeleteBook}
            />
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Feather name="book-open" size={32} color={COLORS.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>
            No books in "{activeShelf === 'reading' ? 'Currently Reading' : activeShelf === 'want_to_read' ? 'Want to Read' : 'Finished'}"
          </Text>
          <Text style={styles.emptySubtitle}>
            Add a book using the live search or enter it manually to track your reading.
          </Text>
          <TouchableOpacity
            style={styles.emptyAddBtn}
            onPress={() => setIsSearchOpen(true)}
          >
            <Feather name="search" size={16} color={COLORS.textInverse} style={{ marginRight: 6 }} />
            <Text style={styles.emptyAddBtnText}>Search Open Library</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Search Modal */}
      <BookSearchModal
        visible={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onAddBook={addBook}
        onOpenManualEntry={() => setIsManualOpen(true)}
      />

      {/* Manual Entry Fallback Modal */}
      <ManualBookModal
        visible={isManualOpen}
        onClose={() => setIsManualOpen(false)}
        onAddBook={addBook}
      />

      {/* Update Page Modal */}
      <UpdatePageModal
        visible={!!selectedBookForPage}
        book={selectedBookForPage}
        onClose={() => setSelectedBookForPage(null)}
        onSavePage={updateBookPage}
      />

      {/* Share Progress Modal */}
      <ShareModal
        visible={!!selectedBookForShare}
        book={selectedBookForShare}
        user={user}
        latestNote={latestNoteForShared}
        onClose={() => setSelectedBookForShare(null)}
      />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  appTitle: {
    color: COLORS.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  appSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  addBookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  addBookBtnText: {
    color: COLORS.textInverse,
    fontSize: 13,
    fontWeight: '700',
  },
  searchBarTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 14,
  },
  searchBarPlaceholder: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  shelfFilterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  shelfPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: 10,
    gap: 6,
  },
  shelfPillActive: {
    backgroundColor: COLORS.accentDim,
    borderColor: COLORS.accent,
  },
  shelfPillText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  shelfPillTextActive: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  countBadge: {
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  countBadgeActive: {
    backgroundColor: COLORS.accent,
  },
  countBadgeText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  countBadgeTextActive: {
    color: COLORS.textInverse,
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  emptyAddBtnText: {
    color: COLORS.textInverse,
    fontSize: 14,
    fontWeight: '700',
  },
});
