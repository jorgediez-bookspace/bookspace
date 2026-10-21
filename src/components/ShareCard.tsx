import React, { forwardRef } from 'react';
import { View, Text, Image, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Book, ReadingNote, UserProfile } from '../types';
import { COLORS } from '../theme/colors';

interface ShareCardProps {
  book: Book;
  user: UserProfile | null;
  quoteNote?: ReadingNote | null;
}

export const ShareCard = forwardRef<View, ShareCardProps>(({ book, user, quoteNote }, ref) => {
  const percent = Math.min(100, Math.round((book.currentPage / Math.max(1, book.totalPages)) * 100));

  return (
    <View ref={ref} style={styles.cardWrapper} collapsable={false}>
      {/* Brand Header */}
      <View style={styles.brandHeader}>
        <View style={styles.logoGroup}>
          <View style={styles.brandBadge}>
            <Image
              source={require('../../assets/icon.png')}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.brandName}>BOOKSPACE</Text>
        </View>
        <Text style={styles.brandTag}>READING MILESTONE</Text>
      </View>

      {/* Book details row */}
      <View style={styles.bookRow}>
        <View style={styles.coverBox}>
          {book.coverUrl ? (
            <Image source={{ uri: book.coverUrl }} style={styles.coverImg} resizeMode="cover" />
          ) : (
            <View style={styles.coverFallback}>
              <Feather name="book" size={28} color={COLORS.accent} />
            </View>
          )}
        </View>

        <View style={styles.bookInfo}>
          <Text style={styles.title} numberOfLines={2}>
            {book.title}
          </Text>
          <Text style={styles.author} numberOfLines={1}>
            by {book.author}
          </Text>

          <View style={styles.statPills}>
            <View style={styles.statPill}>
              <Text style={styles.statPillValue}>
                {book.currentPage} / {book.totalPages}
              </Text>
              <Text style={styles.statPillLabel}>PAGES</Text>
            </View>
            <View style={[styles.statPill, styles.statPillAccent]}>
              <Text style={[styles.statPillValue, { color: COLORS.accent }]}>{percent}%</Text>
              <Text style={[styles.statPillLabel, { color: COLORS.accent }]}>COMPLETE</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Orange Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
        </View>
      </View>

      {/* Highlighted Quote snippet if available */}
      {quoteNote && (quoteNote.quote || quoteNote.thought) && (
        <View style={styles.quoteBox}>
          <Feather name="message-circle" size={14} color={COLORS.accent} style={{ marginBottom: 4 }} />
          {quoteNote.quote ? (
            <Text style={styles.quoteText} numberOfLines={3}>
              “{quoteNote.quote}”
            </Text>
          ) : (
            <Text style={styles.thoughtText} numberOfLines={3}>
              "{quoteNote.thought}"
            </Text>
          )}
          <Text style={styles.quotePage}>— Note on Page {quoteNote.pageNumber}</Text>
        </View>
      )}

      {/* Footer Signature */}
      <View style={styles.footer}>
        <View style={styles.readerMeta}>
          <View style={styles.readerDot} />
          <Text style={styles.readerName}>
            Read by <Text style={{ color: COLORS.textPrimary, fontWeight: '700' }}>{user?.displayName || 'Reader'}</Text>
          </Text>
        </View>
        <Text style={styles.urlSlug}>bookspace.app</Text>
      </View>
    </View>
  );
});

ShareCard.displayName = 'ShareCard';

const styles = StyleSheet.create({
  cardWrapper: {
    backgroundColor: '#000000',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#242424',
    padding: 22,
    width: '100%',
    ...Platform.select({
      web: {
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.8)',
      },
    }),
  },
  brandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  logoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandBadge: {
    backgroundColor: '#000000',
    width: 24,
    height: 24,
    borderRadius: 6,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  brandTag: {
    color: COLORS.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  coverBox: {
    width: 80,
    height: 116,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#262626',
  },
  coverImg: {
    width: '100%',
    height: '100%',
  },
  coverFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 23,
  },
  author: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
  },
  statPills: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  statPill: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  statPillAccent: {
    borderColor: 'rgba(255, 107, 0, 0.4)',
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
  },
  statPillValue: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  statPillLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '700',
    marginTop: 1,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 4,
  },
  quoteBox: {
    backgroundColor: '#111111',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  quoteText: {
    color: '#E0E0E0',
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  thoughtText: {
    color: '#D0D0D0',
    fontSize: 13,
    lineHeight: 18,
  },
  quotePage: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 6,
    fontWeight: '600',
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
  },
  readerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  readerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
  },
  readerName: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  urlSlug: {
    color: COLORS.textMuted,
    fontSize: 11,
    letterSpacing: 0.5,
    fontWeight: '600',
  },
});
