# Privacy Policy for BookSpace

**Effective Date:** October 21, 2026  
**Application Name:** BookSpace  
**Package Name:** `com.jorgediez.bookspace`  
**Developer:** Jorge Diez  
**Contact Email:** privacy@bookspace.app / jorgediez.dev@gmail.com  

---

## 1. Introduction
Welcome to **BookSpace** ("we", "our", or "us"). BookSpace is a minimalist, distraction-free reading companion application designed for mobile devices (Android and iOS) and web previews.

We believe that your reading habits, thoughts, notes, and personal reflections are deeply personal. This Privacy Policy outlines our commitment to your privacy, explaining what data is collected, how it is used, where it is stored, and your rights in compliance with:
- **Google Play Developer Policy & Data Safety requirements**
- **General Data Protection Regulation (GDPR)**
- **California Consumer Privacy Act (CCPA / CPRA)**

---

## 2. Local-First Privacy Philosophy
BookSpace is built upon a **local-first, offline-first** architecture:
- Your reading library, reading progress, focus timer history, and private reading notes are stored **strictly on your physical device** in sandboxed local storage.
- We do not run proprietary remote database servers that log, monetize, or inspect the books you read or the notes you take.
- You can use 100% of the core app completely offline without an active internet connection.

---

## 3. Information We Collect and How We Use It

### A. Account & Profile Information
- **Data Collected:** When you set up a profile, you may provide an email address, display name, and select or upload a profile avatar.
- **Purpose:** Used locally to personalize your reading interface, sign your progress milestone cards, and separate user sessions.
- **Storage:** Persisted locally in your device's private storage database (`AsyncStorage` / SQLite).

### B. User-Generated Reading Content
- **Data Collected:** Book titles, authors, total page counts, current reading page, shelf classifications (*Currently Reading*, *Want to Read*, *Finished*), focus timer session durations, and user-written notes and quotes.
- **Purpose:** To calculate reading percentage progress, display library statistics, power the distraction-free focus timer, and maintain your personal notes journal.
- **Storage:** Stored 100% on your local device.

### C. Device Permissions & System Access
- **Photo Library / Storage Access (`READ_EXTERNAL_STORAGE` / Photo Picker):**  
  Requested **only** when you explicitly choose to select a custom avatar photo from your device's photo gallery via the system image picker. BookSpace accesses only the specific image you select. We do not scan, collect, or upload your photo library.
- **Foreground Audio Playback (`FOREGROUND_SERVICE` / `WAKE_LOCK`):**  
  Used exclusively to keep the ambient soundscapes (rain, fireplace, forest wind, deep space, library) playing smoothly while reading or when the screen locks.
- **Internet Access (`INTERNET` / `ACCESS_NETWORK_STATE`):**  
  Used to:
  1. Query public book catalog metadata via the Open Library API and Google Books API when you search for a book to add.
  2. Stream royalty-free ambient audio tracks for the focus reading mode.

---

## 4. Information We Do NOT Collect
We do **not** collect, track, or share:
- Precise or approximate GPS location data.
- Contacts, address books, or call/SMS logs.
- Audio recordings (the app plays audio; it never accesses or records from the microphone).
- Biometric data.
- Advertising identifiers (such as Google Advertising ID / GAID or Apple IDFA).
- Financial, credit card, or payment information.
- Behavioral profiling or browsing history across other apps.

---

## 5. Third-Party Services
BookSpace integrates a minimal number of trusted third-party services:

1. **Open Library API (Internet Archive) & Google Books API**  
   When searching for a book, your search query text (e.g. title or author) is sent to these public catalog APIs to fetch covers, authors, and page counts. No personally identifiable information (PII) or user identifiers are transmitted with these queries.
2. **Expo & EAS (Expo Application Services)**  
   Used for application deployment, builds, and updates. Expo may collect anonymous, technical crash diagnostic information to maintain app stability.
3. **Native Sharing (Android / iOS Share Sheet)**  
   When you tap "Share Milestone" or "Share Note", the app uses native device APIs (`react-native-view-shot` and `expo-sharing`) to generate a progress card image directly on your device and hands it off to whichever app you choose (WhatsApp, Instagram Stories, X, etc.). BookSpace does not transmit this image to any cloud server.

> **Zero Third-Party Advertising:** BookSpace does not contain any advertising SDKs, ad networks, or data brokers.

---

## 6. Data Retention and Deletion (Google Play Data Safety)

### A. Automatic Deletion
Uninstalling BookSpace from your device immediately purges all local databases, cached book covers, notes, and account settings.

### B. In-App One-Tap Data & Account Deletion
You have full, permanent control over your data directly within the app:
1. Open BookSpace.
2. Go to the **Settings** tab.
3. Scroll down to the **Danger Zone**.
4. Tap **Delete Account** and confirm.

> This action immediately and permanently wipes your user profile, book catalog, reading notes, and session statistics from the device.

---

## 7. Security of Your Information
- **Sandboxed Storage:** All user data is stored within Android’s and iOS’s sandboxed app directory, preventing unauthorized access by other applications on your device.
- **Encrypted Transmission:** All external network requests (book search lookups and audio streaming) utilize Transport Layer Security (HTTPS/TLS) encryption.

---

## 8. Children’s Privacy (COPPA & GDPR-K)
BookSpace is a general utility reading application and is not directed at children under the age of 13 (or 16 in the European Union). We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us immediately, and we will delete the data.

---

## 9. User Rights (GDPR & CCPA / CPRA)
Regardless of your location, BookSpace honors the following rights:
- **Right to Access:** View all your stored books, progress, and notes at any time on your device.
- **Right to Rectify:** Edit your profile, books, pages, and notes directly in the app.
- **Right to Erasure ("Right to be Forgotten"):** Delete individual books or notes, or perform a total wipe via the "Delete Account" button.
- **"Do Not Sell My Personal Information":** We do not sell, rent, or trade your personal information to third parties.

---

## 10. Changes to This Privacy Policy
We may update this Privacy Policy from time to time. Any changes will be published with an updated "Effective Date" at the top of this document. Continued use of the application after changes are posted represents your acceptance of the updated policy.

---

## 11. Contact Information
If you have questions, comments, or concerns regarding this Privacy Policy or your data privacy, please contact:

- **Developer:** Jorge Diez
- **Application:** BookSpace
- **Email:** privacy@bookspace.app
- **Alternative Contact:** jorgediez.dev@gmail.com
- **Website / Repository:** https://github.com/jorgediez-bookspace/bookspace
- **Direct Policy URL:** https://github.com/jorgediez-bookspace/bookspace/blob/main/PRIVACY_POLICY.md
- **GitHub Pages (Optional):** https://jorgediez-bookspace.github.io/bookspace/
