import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Book, BookShelf } from '../types';
import { COLORS } from '../theme/colors';

interface BookCardProps {
  book: Book;
  onFocus: (book: Book) => void;
  onUpdatePage: (book: Book) => void;
  onMoveShelf: (book: Book) => void;
  onShare: (book: Book) => void;
  onDelete: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onFocus,
  onUpdatePage,
  onMoveShelf,
  onShare,
  onDelete,
}) => {
  const percent = Math.min(100, Math.round((book.currentPage / Math.max(1, book.totalPages)) * 100));

  const getShelfBadge = (shelf: BookShelf) => {
    switch (shelf) {
      case 'reading':
        return { label: 'Reading', color: COLORS.accent, bg: COLORS.accentDim };
      case 'want_to_read':
        return { label: 'Want to Read', color: COLORS.shelfWant, bg: 'rgba(10, 132, 255, 0.15)' };
      case 'finished':
        return { label: 'Finished', color: COLORS.shelfFinished, bg: COLORS.successDim };
    }
  };

  const badge = getShelfBadge(book.shelf);

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        {/* Book Cover */}
        <View style={styles.coverContainer}>
          {book.coverUrl ? (
            <Image
              source={{ uri: book.coverUrl }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.coverFallback}>
              <Feather name="book" size={24} color={COLORS.accent} />
              <Text style={styles.coverFallbackText} numberOfLines={2}>
                {book.title}
              </Text>
            </View>
          )}
        </View>

        {/* Book Meta */}
        <View style={styles.metaContainer}>
          <View style={styles.headerRow}>
            <View style={[styles.badge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
            </View>
            <View style={styles.topActions}>
              <TouchableOpacity
                onPress={() => onMoveShelf(book)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.iconBtn}
                accessibilityLabel="Change shelf"
              >
                <Feather name="move" size={15} color={COLORS.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onDelete(book)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.iconBtn}
                accessibilityLabel="Delete book"
              >
                <Feather name="trash-2" size={15} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.title} numberOfLines={2}>
            {book.title}
          </Text>
          <Text style={styles.author} numberOfLines={1}>
            {book.author}
          </Text>

          {/* Progress Section */}
          <View style={styles.progressSection}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
            </View>
            <View style={styles.progressTextRow}>
              <Text style={styles.progressPages}>
                Page {book.currentPage} of {book.totalPages}
              </Text>
              <Text style={styles.progressPercent}>{percent}%</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons Row */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.primaryActionBtn}
          onPress={() => onFocus(book)}
          activeOpacity={0.8}
        >
          <Feather name="play" size={14} color={COLORS.textInverse} style={{ marginRight: 6 }} />
          <Text style={styles.primaryActionText}>Focus Session</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryActionBtn}
          onPress={() => onUpdatePage(book)}
          activeOpacity={0.7}
        >
          <Feather name="edit-3" size={13} color={COLORS.textPrimary} style={{ marginRight: 4 }} />
          <Text style={styles.secondaryActionText}>Page</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryActionBtn}
          onPress={() => onShare(book)}
          activeOpacity={0.7}
        >
          <Feather name="share-2" size={13} color={COLORS.accent} style={{ marginRight: 4 }} />
          <Text style={[styles.secondaryActionText, { color: COLORS.accent }]}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
      },
      default: {
        elevation: 3,
      },
    }),
  },
  topRow: {
    flexDirection: 'row',
  },
  coverContainer: {
    width: 72,
    height: 104,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    backgroundColor: '#161616',
  },
  coverFallbackText: {
    color: COLORS.textMuted,
    fontSize: 9,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '600',
  },
  metaContainer: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    padding: 4,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 21,
  },
  author: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  progressSection: {
    marginTop: 8,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#202020',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 3,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  progressPages: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  progressPercent: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  primaryActionBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  primaryActionText: {
    color: COLORS.textInverse,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  secondaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  secondaryActionText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
});
