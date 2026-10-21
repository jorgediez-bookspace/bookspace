import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useBooks } from '../context/BookContext';
import { useAuth } from '../context/AuthContext';
import { ReadingNote, Book } from '../types';
import { QuickNoteModal } from '../components/QuickNoteModal';
import { ShareModal } from '../components/ShareModal';
import { COLORS } from '../theme/colors';

export const NotesScreen: React.FC = () => {
  const { user } = useAuth();
  const { books, notes, addNote, updateNote, deleteNote } = useBooks();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookFilter, setSelectedBookFilter] = useState<string>('all');
  const [isNewNoteOpen, setIsNewNoteOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<ReadingNote | null>(null);
  const [shareNoteBook, setShareNoteBook] = useState<{ book: Book; note: ReadingNote } | null>(null);

  // Filter notes by search query and selected book
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const matchesBook = selectedBookFilter === 'all' || n.bookId === selectedBookFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        n.thought.toLowerCase().includes(q) ||
        (n.quote && n.quote.toLowerCase().includes(q)) ||
        n.bookTitle.toLowerCase().includes(q);
      return matchesBook && matchesSearch;
    });
  }, [notes, selectedBookFilter, searchQuery]);

  const handleDeleteNote = (note: ReadingNote) => {
    const confirmMsg = 'Are you sure you want to delete this reading note?';
    if (Platform.OS === 'web') {
      if (window.confirm(confirmMsg)) {
        deleteNote(note.id);
      }
    } else {
      Alert.alert('Delete Note', confirmMsg, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteNote(note.id) },
      ]);
    }
  };

  const handleShareNote = (note: ReadingNote) => {
    const book = books.find((b) => b.id === note.bookId) || {
      id: note.bookId,
      title: note.bookTitle,
      author: note.bookAuthor,
      totalPages: Math.max(note.pageNumber, 300),
      currentPage: note.pageNumber,
      shelf: 'reading' as const,
    };
    setShareNoteBook({ book, note });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.screenTitle}>Reading Notes</Text>
          <Text style={styles.screenSubtitle}>
            {notes.length} thoughts & quotes captured
          </Text>
        </View>
        <TouchableOpacity
          style={styles.newNoteBtn}
          onPress={() => setIsNewNoteOpen(true)}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={16} color={COLORS.textInverse} style={{ marginRight: 4 }} />
          <Text style={styles.newNoteBtnText}>New Note</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <Feather name="search" size={16} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by quote, thought, or book..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Feather name="x" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Book Filter Pills */}
      <View style={styles.filterPillsContainer}>
        <TouchableOpacity
          style={[styles.filterPill, selectedBookFilter === 'all' && styles.filterPillActive]}
          onPress={() => setSelectedBookFilter('all')}
        >
          <Text
            style={[
              styles.filterPillText,
              selectedBookFilter === 'all' && styles.filterPillTextActive,
            ]}
          >
            All Books ({notes.length})
          </Text>
        </TouchableOpacity>

        {books.map((b) => {
          const isSelected = selectedBookFilter === b.id;
          const bookNotesCount = notes.filter((n) => n.bookId === b.id).length;
          return (
            <TouchableOpacity
              key={b.id}
              style={[styles.filterPill, isSelected && styles.filterPillActive]}
              onPress={() => setSelectedBookFilter(b.id)}
            >
              <Text
                style={[styles.filterPillText, isSelected && styles.filterPillTextActive]}
                numberOfLines={1}
              >
                {b.title} ({bookNotesCount})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Notes Feed */}
      {filteredNotes.length > 0 ? (
        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const serifFont = item.isSerif
              ? { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }
              : undefined;

            return (
              <View style={styles.noteCard}>
                {/* Note Meta Header */}
                <View style={styles.noteCardHeader}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.noteBookTitle} numberOfLines={1}>
                      {item.bookTitle}
                    </Text>
                    <Text style={styles.noteBookAuthor} numberOfLines={1}>
                      by {item.bookAuthor}
                    </Text>
                  </View>

                  <View style={styles.pageBadge}>
                    <Text style={styles.pageBadgeText}>p. {item.pageNumber}</Text>
                  </View>

                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      onPress={() => handleShareNote(item)}
                      style={styles.iconAction}
                      accessibilityLabel="Share note"
                    >
                      <Feather name="share-2" size={15} color={COLORS.accent} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setEditingNote(item)}
                      style={styles.iconAction}
                      accessibilityLabel="Edit note"
                    >
                      <Feather name="edit-2" size={15} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteNote(item)}
                      style={styles.iconAction}
                      accessibilityLabel="Delete note"
                    >
                      <Feather name="trash-2" size={15} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Quote block if present */}
                {item.quote ? (
                  <View style={styles.quoteBox}>
                    <Feather
                      name="bookmark"
                      size={12}
                      color={COLORS.accent}
                      style={{ marginBottom: 4 }}
                    />
                    <Text style={[styles.quoteText, serifFont]}>“{item.quote}”</Text>
                  </View>
                ) : null}

                {/* Thought reflection */}
                {item.thought ? (
                  <Text style={[styles.thoughtText, serifFont]}>{item.thought}</Text>
                ) : null}

                {/* Timestamp & typography indicator */}
                <View style={styles.cardFooter}>
                  <Text style={styles.timeText}>
                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                  {item.isSerif && (
                    <View style={styles.serifIndicator}>
                      <Text style={styles.serifIndicatorText}>Serif</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          }}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyCircle}>
            <Feather name="edit-3" size={32} color={COLORS.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>No Notes Found</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery
              ? `No notes match "${searchQuery}".`
              : 'Jot down inspiring quotes and reflections as you read.'}
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => setIsNewNoteOpen(true)}
          >
            <Feather name="plus" size={16} color={COLORS.textInverse} style={{ marginRight: 6 }} />
            <Text style={styles.emptyBtnText}>Create Reading Note</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* New Note Modal */}
      <QuickNoteModal
        visible={isNewNoteOpen}
        activeBook={null}
        books={books}
        onClose={() => setIsNewNoteOpen(false)}
        onSaveNote={async (noteData) => {
          await addNote(noteData);
          setIsNewNoteOpen(false);
        }}
      />

      {/* Edit Note Modal */}
      <QuickNoteModal
        visible={!!editingNote}
        activeBook={null}
        books={books}
        existingNote={editingNote}
        onClose={() => setEditingNote(null)}
        onSaveNote={async (noteData) => {
          if (editingNote) {
            await updateNote(editingNote.id, noteData);
          }
          setEditingNote(null);
        }}
      />

      {/* Share Quote Card Modal */}
      <ShareModal
        visible={!!shareNoteBook}
        book={shareNoteBook?.book || null}
        user={user}
        latestNote={shareNoteBook?.note || null}
        onClose={() => setShareNoteBook(null)}
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
  newNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  newNoteBtnText: {
    color: COLORS.textInverse,
    fontSize: 13,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  filterPillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  filterPill: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    maxWidth: 160,
  },
  filterPillActive: {
    backgroundColor: COLORS.accentDim,
    borderColor: COLORS.accent,
  },
  filterPillText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 24,
  },
  noteCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 14,
  },
  noteCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  noteBookTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  noteBookAuthor: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 1,
  },
  pageBadge: {
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 10,
  },
  pageBadgeText: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '700',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconAction: {
    padding: 4,
  },
  quoteBox: {
    backgroundColor: COLORS.surfaceElevated,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  quoteText: {
    color: '#ECECEC',
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  thoughtText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  timeText: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  serifIndicator: {
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  serifIndicatorText: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  emptyCircle: {
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
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 18,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  emptyBtnText: {
    color: COLORS.textInverse,
    fontSize: 14,
    fontWeight: '700',
  },
});
