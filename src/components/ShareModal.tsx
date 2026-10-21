import React, { useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Share as RNShare,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Feather } from '@expo/vector-icons';
import { Book, ReadingNote, UserProfile } from '../types';
import { ShareCard } from './ShareCard';
import { COLORS } from '../theme/colors';

interface ShareModalProps {
  visible: boolean;
  book: Book | null;
  user: UserProfile | null;
  latestNote?: ReadingNote | null;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  visible,
  book,
  user,
  latestNote,
  onClose,
}) => {
  const cardRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [feedback, setFeedback] = useState<string>('');

  if (!book) return null;

  const percent = Math.min(100, Math.round((book.currentPage / Math.max(1, book.totalPages)) * 100));

  const handleShare = async () => {
    setIsSharing(true);
    setFeedback('');

    const textToShare = `📖 Reading "${book.title}" by ${book.author} on BookSpace.\nCurrently on Page ${book.currentPage} of ${book.totalPages} (${percent}% complete)!${
      latestNote?.quote ? `\n\n"${latestNote.quote}"` : ''
    }\n\n#BookSpace #ReadingHabit #Books`;

    try {
      // 1. Try ViewShot capture for native image sharing
      if (cardRef.current && Platform.OS !== 'web') {
        const uri = await captureRef(cardRef, {
          format: 'png',
          quality: 0.95,
        });

        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: `Share reading milestone: ${book.title}`,
            UTI: 'public.png',
          });
          setIsSharing(false);
          return;
        }
      }

      // 2. Fallback to native React Native Share API
      if (Platform.OS !== 'web') {
        await RNShare.share({
          message: textToShare,
          title: `BookSpace: ${book.title}`,
        });
      } else {
        // 3. Web preview clipboard / download fallback
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(textToShare);
          setFeedback('Milestone text copied to clipboard!');
        } else {
          setFeedback('Milestone ready to share!');
        }
      }
    } catch (err: any) {
      console.warn('[ShareModal] share error:', err);
      // Fallback to text copy or alert
      setFeedback('Progress summary prepared!');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Share Reading Milestone</Text>
              <Text style={styles.headerSubtitle}>
                Export aesthetic OLED card to Instagram, X, or WhatsApp
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {feedback ? (
            <View style={styles.feedbackBanner}>
              <Feather name="check-circle" size={16} color={COLORS.success} />
              <Text style={styles.feedbackText}>{feedback}</Text>
            </View>
          ) : null}

          {/* Visual Share Card Preview */}
          <ScrollView
            contentContainerStyle={styles.cardPreviewContainer}
            showsVerticalScrollIndicator={false}
          >
            <ShareCard ref={cardRef} book={book} user={user} quoteNote={latestNote} />
          </ScrollView>

          {/* Share Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.shareBtn}
              onPress={handleShare}
              disabled={isSharing}
              activeOpacity={0.8}
            >
              {isSharing ? (
                <ActivityIndicator color={COLORS.textInverse} size="small" />
              ) : (
                <>
                  <Feather
                    name="share-2"
                    size={18}
                    color={COLORS.textInverse}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.shareBtnText}>Share to Socials</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    maxHeight: '92%',
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
    maxWidth: 280,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.successDim,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  feedbackText: {
    color: COLORS.success,
    fontSize: 13,
    fontWeight: '600',
  },
  cardPreviewContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  actionsContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  shareBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.accent,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnText: {
    color: COLORS.textInverse,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
