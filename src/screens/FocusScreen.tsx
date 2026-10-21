import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { useBooks } from '../context/BookContext';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import { Book } from '../types';
import { QuickNoteModal } from '../components/QuickNoteModal';
import { UpdatePageModal } from '../components/UpdatePageModal';
import { ShareModal } from '../components/ShareModal';
import { COLORS } from '../theme/colors';

const TIMER_PRESETS = [
  { label: 'Stopwatch', minutes: 0 },
  { label: '25m', minutes: 25 },
  { label: '45m', minutes: 45 },
  { label: '60m', minutes: 60 },
];

export const FocusScreen: React.FC = () => {
  const { user } = useAuth();
  const {
    books,
    activeBook,
    setActiveBook,
    updateBookPage,
    addNote,
    recordSession,
  } = useBooks();

  const {
    soundscapes,
    currentSoundscape,
    isPlaying,
    volume,
    togglePlay,
    selectSoundscape,
    setVolume,
  } = useAudio();

  // Timer states
  const [timerMode, setTimerMode] = useState<number>(25); // 0 = stopwatch, >0 = countdown
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Modals inside Focus mode
  const [isNoteModalOpen, setIsNoteModalOpen] = useState<boolean>(false);
  const [isEndSessionModalOpen, setIsEndSessionModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  // Session start tracking
  const sessionStartPage = useRef<number>(activeBook?.currentPage || 0);
  const timerIntervalRef = useRef<any>(null);

  // Sync active book page
  useEffect(() => {
    if (activeBook) {
      sessionStartPage.current = activeBook.currentPage;
    }
  }, [activeBook?.id]);

  // Handle timer ticks
  useEffect(() => {
    if (isRunning) {
      timerIntervalRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);

        if (timerMode > 0) {
          setSecondsRemaining((prev) => {
            if (prev <= 1) {
              clearInterval(timerIntervalRef.current);
              setIsRunning(false);
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRunning, timerMode]);

  const handleSelectPreset = (minutes: number) => {
    setIsRunning(false);
    setTimerMode(minutes);
    setSecondsElapsed(0);
    setSecondsRemaining(minutes * 60);
  };

  const handleToggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setSecondsElapsed(0);
    setSecondsRemaining(timerMode * 60);
  };

  const handleEndSession = () => {
    setIsRunning(false);
    setIsEndSessionModalOpen(true);
  };

  const handleFinishSessionProgress = (bookId: string, endPage: number) => {
    const durationMins = Math.max(1, Math.round(secondsElapsed / 60));
    recordSession({
      bookId,
      bookTitle: activeBook?.title || 'Reading Session',
      startPage: sessionStartPage.current,
      endPage,
      durationMinutes: durationMins,
      soundscapeId: currentSoundscape.id,
    });

    handleResetTimer();
    setIsEndSessionModalOpen(false);
    // Offer sharing
    setIsShareModalOpen(true);
  };

  // Format MM:SS
  const formatTime = () => {
    const totalSecs = timerMode === 0 ? secondsElapsed : secondsRemaining;
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const readingBooks = books.filter((b) => b.shelf === 'reading');
  const availableBooks = readingBooks.length > 0 ? readingBooks : books;

  return (
    <View style={styles.container}>
      {/* Immersive: Hide Status Bar */}
      <StatusBar hidden={true} />

      {/* Subtle notification banner */}
      <View style={styles.silenceBanner}>
        <Feather name="bell-off" size={13} color={COLORS.accent} />
        <Text style={styles.silenceBannerText}>
          Silence notifications & immerse in your reading space
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Active Book Selector */}
        <View style={styles.bookSelectorCard}>
          <Text style={styles.sectionHeaderLabel}>FOCUS BOOK</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bookPillsScroll}>
            {availableBooks.map((book) => {
              const isSelected = activeBook?.id === book.id;
              return (
                <TouchableOpacity
                  key={book.id}
                  style={[styles.bookPill, isSelected && styles.bookPillActive]}
                  onPress={() => setActiveBook(book)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.bookPillTitle, isSelected && styles.bookPillTitleActive]} numberOfLines={1}>
                    {book.title}
                  </Text>
                  <Text style={styles.bookPillProgress}>
                    p. {book.currentPage}/{book.totalPages}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Minimalist Session Timer */}
        <View style={styles.timerCard}>
          {/* Preset Buttons */}
          <View style={styles.presetsRow}>
            {TIMER_PRESETS.map((preset) => {
              const active = timerMode === preset.minutes;
              return (
                <TouchableOpacity
                  key={preset.label}
                  style={[styles.presetBtn, active && styles.presetBtnActive]}
                  onPress={() => handleSelectPreset(preset.minutes)}
                >
                  <Text style={[styles.presetBtnText, active && styles.presetBtnTextActive]}>
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Big Minimalist Digits */}
          <View style={styles.clockCircle}>
            <Text style={styles.clockDigits}>{formatTime()}</Text>
            <Text style={styles.clockModeLabel}>
              {timerMode === 0 ? 'STOPWATCH' : isRunning ? 'FOCUSING' : 'READY'}
            </Text>
          </View>

          {/* Timer Controls */}
          <View style={styles.timerControlsRow}>
            <TouchableOpacity
              style={styles.iconCircleBtn}
              onPress={handleResetTimer}
              accessibilityLabel="Reset timer"
            >
              <Feather name="rotate-ccw" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.playBtn, isRunning && styles.playBtnActive]}
              onPress={handleToggleTimer}
              activeOpacity={0.8}
            >
              <Feather
                name={isRunning ? 'pause' : 'play'}
                size={22}
                color={COLORS.textInverse}
              />
              <Text style={styles.playBtnText}>{isRunning ? 'Pause' : 'Start Focus'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.endBtn}
              onPress={handleEndSession}
              activeOpacity={0.8}
            >
              <Feather name="check-square" size={16} color={COLORS.accent} style={{ marginRight: 6 }} />
              <Text style={styles.endBtnText}>End</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ambient Soundscape Mixer */}
        <View style={styles.audioCard}>
          <View style={styles.audioHeader}>
            <View>
              <Text style={styles.sectionHeaderLabel}>AMBIENT SOUNDSCAPES</Text>
              <Text style={styles.currentTrackTitle}>
                {currentSoundscape.name} • {currentSoundscape.subtitle}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.soundToggleBtn, isPlaying && styles.soundToggleBtnActive]}
              onPress={togglePlay}
              activeOpacity={0.8}
            >
              <Feather
                name={isPlaying ? 'volume-2' : 'volume-x'}
                size={18}
                color={isPlaying ? COLORS.accent : COLORS.textMuted}
              />
            </TouchableOpacity>
          </View>

          {/* Soundscapes Carousel / Grid */}
          <View style={styles.soundscapesGrid}>
            {soundscapes.map((s) => {
              const isSelected = currentSoundscape.id === s.id;
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.soundscapeChip, isSelected && styles.soundscapeChipActive]}
                  onPress={() => selectSoundscape(s)}
                  activeOpacity={0.7}
                >
                  <Feather
                    name={s.icon as any}
                    size={14}
                    color={isSelected ? COLORS.accent : COLORS.textSecondary}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.soundscapeChipText, isSelected && styles.soundscapeChipTextActive]}>
                    {s.name}
                  </Text>
                  {isSelected && isPlaying && (
                    <View style={styles.playingIndicator}>
                      <View style={styles.indicatorBar} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Volume Control Stepper */}
          <View style={styles.volumeRow}>
            <Feather name="volume-1" size={14} color={COLORS.textMuted} />
            <View style={styles.volumeStepsContainer}>
              {[0.2, 0.4, 0.6, 0.8, 1.0].map((step) => {
                const isActive = volume >= step - 0.05;
                return (
                  <TouchableOpacity
                    key={step}
                    style={[styles.volumeBarStep, isActive && styles.volumeBarStepActive]}
                    onPress={() => setVolume(step)}
                  />
                );
              })}
            </View>
            <Feather name="volume-2" size={14} color={COLORS.textSecondary} />
            <Text style={styles.volumePercentText}>{Math.round(volume * 100)}%</Text>
          </View>
        </View>

        {/* Quick In-Session Note Trigger */}
        <TouchableOpacity
          style={styles.quickNoteBtn}
          onPress={() => setIsNoteModalOpen(true)}
          activeOpacity={0.8}
        >
          <Feather name="edit-2" size={16} color={COLORS.textPrimary} style={{ marginRight: 8 }} />
          <Text style={styles.quickNoteBtnText}>Jot a Quote or Thought</Text>
          <View style={styles.quickNoteBadge}>
            <Text style={styles.quickNoteBadgeText}>In-Session Note</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Quick Note Modal */}
      <QuickNoteModal
        visible={isNoteModalOpen}
        activeBook={activeBook}
        books={books}
        onClose={() => setIsNoteModalOpen(false)}
        onSaveNote={async (noteData) => {
          await addNote(noteData);
          setIsNoteModalOpen(false);
        }}
      />

      {/* End Session Progress Modal */}
      <UpdatePageModal
        visible={isEndSessionModalOpen}
        book={activeBook}
        onClose={() => setIsEndSessionModalOpen(false)}
        onSavePage={handleFinishSessionProgress}
      />

      {/* Share Progress Modal */}
      <ShareModal
        visible={isShareModalOpen}
        book={activeBook}
        user={user}
        onClose={() => setIsShareModalOpen(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'ios' ? 14 : 10,
  },
  silenceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F0F0F',
    borderWidth: 1,
    borderColor: '#1F1F1F',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  silenceBannerText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  sectionHeaderLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  bookSelectorCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  bookPillsScroll: {
    flexDirection: 'row',
  },
  bookPill: {
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginRight: 8,
    minWidth: 120,
    maxWidth: 180,
  },
  bookPillActive: {
    backgroundColor: COLORS.accentDim,
    borderColor: COLORS.accent,
  },
  bookPillTitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  bookPillTitleActive: {
    color: COLORS.accent,
  },
  bookPillProgress: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  timerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    marginBottom: 14,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  presetBtn: {
    backgroundColor: COLORS.surfaceElevated,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetBtnActive: {
    backgroundColor: COLORS.accentDim,
    borderColor: COLORS.accent,
  },
  presetBtnText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  presetBtnTextActive: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  clockCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  clockDigits: {
    color: COLORS.textPrimary,
    fontSize: 54,
    fontWeight: '800',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  clockModeLabel: {
    color: COLORS.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  timerControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 14,
  },
  iconCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    gap: 8,
  },
  playBtnActive: {
    backgroundColor: '#E05F00',
  },
  playBtnText: {
    color: COLORS.textInverse,
    fontSize: 15,
    fontWeight: '800',
  },
  endBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
  },
  endBtnText: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  audioCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  audioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentTrackTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  soundToggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundToggleBtnActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentDim,
  },
  soundscapesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  soundscapeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  soundscapeChipActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentDim,
  },
  soundscapeChipText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  soundscapeChipTextActive: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  playingIndicator: {
    marginLeft: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
  },
  indicatorBar: {},
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  volumeStepsContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  volumeBarStep: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#202020',
  },
  volumeBarStepActive: {
    backgroundColor: COLORS.accent,
  },
  volumePercentText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    minWidth: 32,
    textAlign: 'right',
  },
  quickNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 14,
  },
  quickNoteBtnText: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  quickNoteBadge: {
    backgroundColor: COLORS.accentDim,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  quickNoteBadgeText: {
    color: COLORS.accent,
    fontSize: 10,
    fontWeight: '700',
  },
});
