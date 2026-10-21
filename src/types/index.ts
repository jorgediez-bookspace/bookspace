export type BookShelf = 'reading' | 'want_to_read' | 'finished';

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  totalPages: number;
  currentPage: number;
  shelf: BookShelf;
  lastReadAt?: string;
  rating?: number;
}

export interface ReadingNote {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  pageNumber: number;
  quote?: string;
  thought: string;
  createdAt: string;
  isSerif?: boolean;
}

export interface ReadingSession {
  id: string;
  bookId: string;
  bookTitle: string;
  startPage: number;
  endPage: number;
  durationMinutes: number;
  soundscapeId?: string;
  timestamp: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  avatarPresetId?: string;
}

export interface Soundscape {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  audioUrl: string;
  fallbackToneFreq?: number;
}

export interface SearchBookResult {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  totalPages: number;
  publishedYear?: string | number;
  source: 'openlibrary' | 'googlebooks' | 'manual';
}

export interface UserPreferences {
  defaultTimerMinutes: number; // 0 for stopwatch, 25, 45, 60
  defaultSerifNotes: boolean;
  autoPlayAmbient: boolean;
  masterVolume: number; // 0.0 to 1.0
}
