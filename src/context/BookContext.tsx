import React, { createContext, useContext, useState, useEffect } from 'react';
import { Book, ReadingNote, ReadingSession, BookShelf } from '../types';
import { AppStorage } from '../storage/storage';
import { useAuth } from './AuthContext';

interface BookContextType {
  books: Book[];
  notes: ReadingNote[];
  sessions: ReadingSession[];
  activeBook: Book | null;
  setActiveBook: (book: Book | null) => void;
  addBook: (book: Omit<Book, 'id'>) => Promise<Book>;
  updateBook: (id: string, updates: Partial<Book>) => Promise<void>;
  updateBookPage: (id: string, newPage: number) => Promise<void>;
  updateBookShelf: (id: string, shelf: BookShelf) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  addNote: (note: Omit<ReadingNote, 'id' | 'createdAt'>) => Promise<ReadingNote>;
  updateNote: (id: string, updates: Partial<ReadingNote>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  recordSession: (session: Omit<ReadingSession, 'id' | 'timestamp'>) => Promise<void>;
  reloadUserData: () => Promise<void>;
}

// 3 Pre-seeded books as required
const SEED_BOOKS: Book[] = [
  {
    id: 'book-seed-1',
    title: 'Atomic Habits',
    author: 'James Clear',
    coverUrl: 'https://covers.openlibrary.org/b/id/12843460-M.jpg',
    totalPages: 320,
    currentPage: 142, // 44% completed
    shelf: 'reading',
    lastReadAt: new Date().toISOString(),
    rating: 5,
  },
  {
    id: 'book-seed-2',
    title: 'Klara and the Sun',
    author: 'Kazuo Ishiguro',
    coverUrl: 'https://covers.openlibrary.org/b/id/10521270-M.jpg',
    totalPages: 303,
    currentPage: 0,
    shelf: 'want_to_read',
  },
  {
    id: 'book-seed-3',
    title: 'Deep Work: Rules for Focused Success',
    author: 'Cal Newport',
    coverUrl: 'https://covers.openlibrary.org/b/id/8315126-M.jpg',
    totalPages: 304,
    currentPage: 304,
    shelf: 'finished',
    lastReadAt: '2026-09-28T14:30:00.000Z',
    rating: 5,
  },
];

// Pre-seeded reading notes
const SEED_NOTES: ReadingNote[] = [
  {
    id: 'note-seed-1',
    bookId: 'book-seed-1',
    bookTitle: 'Atomic Habits',
    bookAuthor: 'James Clear',
    pageNumber: 27,
    quote: 'You do not rise to the level of your goals. You fall to the level of your systems.',
    thought:
      'Focus on the process instead of the finish line. Reading 15 minutes every morning builds the habit organically.',
    createdAt: '2026-10-10T09:15:00.000Z',
    isSerif: true,
  },
  {
    id: 'note-seed-2',
    bookId: 'book-seed-1',
    bookTitle: 'Atomic Habits',
    bookAuthor: 'James Clear',
    pageNumber: 114,
    quote: 'Environment is the invisible hand that shapes human behavior.',
    thought:
      'Setting up a distraction-free OLED space with ambient sounds creates an immediate Pavlovian trigger for deep reading.',
    createdAt: '2026-10-12T16:45:00.000Z',
    isSerif: false,
  },
  {
    id: 'note-seed-3',
    bookId: 'book-seed-3',
    bookTitle: 'Deep Work: Rules for Focused Success',
    bookAuthor: 'Cal Newport',
    pageNumber: 62,
    quote: 'Clarity about what matters provides clarity about what does not.',
    thought:
      'Eliminating phone notifications and shallow reading unlocks deep comprehension and retention.',
    createdAt: '2026-09-25T11:20:00.000Z',
    isSerif: true,
  },
];

const BookContext = createContext<BookContextType | undefined>(undefined);

export const BookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [notes, setNotes] = useState<ReadingNote[]>([]);
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [activeBook, setActiveBook] = useState<Book | null>(null);

  const userId = user?.id || 'demo-user-1';
  const BOOKS_KEY = `@bookspace:books:${userId}`;
  const NOTES_KEY = `@bookspace:notes:${userId}`;
  const SESSIONS_KEY = `@bookspace:sessions:${userId}`;

  const loadData = async () => {
    if (!user) {
      setBooks([]);
      setNotes([]);
      setSessions([]);
      setActiveBook(null);
      return;
    }

    try {
      let savedBooks = await AppStorage.getItem<Book[] | null>(BOOKS_KEY, null);
      if (!savedBooks || savedBooks.length === 0) {
        // Pre-seed demo books
        savedBooks = SEED_BOOKS;
        await AppStorage.setItem(BOOKS_KEY, savedBooks);
      }

      let savedNotes = await AppStorage.getItem<ReadingNote[] | null>(NOTES_KEY, null);
      if (!savedNotes || savedNotes.length === 0) {
        // Pre-seed demo notes
        savedNotes = SEED_NOTES;
        await AppStorage.setItem(NOTES_KEY, savedNotes);
      }

      const savedSessions = await AppStorage.getItem<ReadingSession[]>(SESSIONS_KEY, []);

      setBooks(savedBooks);
      setNotes(savedNotes);
      setSessions(savedSessions);

      // Default active book to currently reading
      const readingBook = savedBooks.find((b) => b.shelf === 'reading') || savedBooks[0] || null;
      setActiveBook(readingBook);
    } catch (err) {
      console.warn('[BookContext] loadData error:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const addBook = async (bookData: Omit<Book, 'id'>): Promise<Book> => {
    const newBook: Book = {
      ...bookData,
      id: `book_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      lastReadAt: new Date().toISOString(),
    };

    const updated = [newBook, ...books];
    setBooks(updated);
    await AppStorage.setItem(BOOKS_KEY, updated);

    if (newBook.shelf === 'reading' && !activeBook) {
      setActiveBook(newBook);
    }

    return newBook;
  };

  const updateBook = async (id: string, updates: Partial<Book>) => {
    const updated = books.map((b) => (b.id === id ? { ...b, ...updates } : b));
    setBooks(updated);
    await AppStorage.setItem(BOOKS_KEY, updated);

    if (activeBook?.id === id) {
      setActiveBook({ ...activeBook, ...updates });
    }
  };

  const updateBookPage = async (id: string, newPage: number) => {
    const targetBook = books.find((b) => b.id === id);
    if (!targetBook) return;

    const clampedPage = Math.max(0, Math.min(targetBook.totalPages, newPage));
    const isFinished = clampedPage >= targetBook.totalPages;
    const newShelf = isFinished ? 'finished' : targetBook.shelf === 'want_to_read' ? 'reading' : targetBook.shelf;

    const updates: Partial<Book> = {
      currentPage: clampedPage,
      shelf: newShelf,
      lastReadAt: new Date().toISOString(),
    };

    await updateBook(id, updates);
  };

  const updateBookShelf = async (id: string, shelf: BookShelf) => {
    await updateBook(id, { shelf });
  };

  const deleteBook = async (id: string) => {
    const updated = books.filter((b) => b.id !== id);
    setBooks(updated);
    await AppStorage.setItem(BOOKS_KEY, updated);

    // Also delete notes for this book
    const updatedNotes = notes.filter((n) => n.bookId !== id);
    setNotes(updatedNotes);
    await AppStorage.setItem(NOTES_KEY, updatedNotes);

    if (activeBook?.id === id) {
      const nextActive = updated.find((b) => b.shelf === 'reading') || updated[0] || null;
      setActiveBook(nextActive);
    }
  };

  const addNote = async (noteData: Omit<ReadingNote, 'id' | 'createdAt'>): Promise<ReadingNote> => {
    const newNote: ReadingNote = {
      ...noteData,
      id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    await AppStorage.setItem(NOTES_KEY, updated);
    return newNote;
  };

  const updateNote = async (id: string, updates: Partial<ReadingNote>) => {
    const updated = notes.map((n) => (n.id === id ? { ...n, ...updates } : n));
    setNotes(updated);
    await AppStorage.setItem(NOTES_KEY, updated);
  };

  const deleteNote = async (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    await AppStorage.setItem(NOTES_KEY, updated);
  };

  const recordSession = async (sessionData: Omit<ReadingSession, 'id' | 'timestamp'>) => {
    const newSession: ReadingSession = {
      ...sessionData,
      id: `session_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    const updated = [newSession, ...sessions];
    setSessions(updated);
    await AppStorage.setItem(SESSIONS_KEY, updated);

    // Update book current page if endPage changed
    if (sessionData.endPage > sessionData.startPage) {
      await updateBookPage(sessionData.bookId, sessionData.endPage);
    }
  };

  return (
    <BookContext.Provider
      value={{
        books,
        notes,
        sessions,
        activeBook,
        setActiveBook,
        addBook,
        updateBook,
        updateBookPage,
        updateBookShelf,
        deleteBook,
        addNote,
        updateNote,
        deleteNote,
        recordSession,
        reloadUserData: loadData,
      }}
    >
      {children}
    </BookContext.Provider>
  );
};

export const useBooks = () => {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('useBooks must be used within a BookProvider');
  }
  return context;
};
