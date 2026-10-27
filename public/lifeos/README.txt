LifeOS — YorpHives product

Direction: cross-platform native-capable personal productivity application. The current /lifeos/ browser/PWA is a workflow prototype, not the intended final delivery model.

Recommended stack: Flutter/Dart shared codebase; SQLite local-first persistence; Android first, then iOS and desktop after validation. Optional authenticated sync is a later, opt-in phase and is not active.

Read /lifeos/ROADMAP.txt for phased delivery, /lifeos/NATIVE-APP-ARCHITECTURE.txt for the proposed technical architecture, /lifeos/NATIVE-STARTER-STATUS.txt for native scaffold and verification status, /lifeos/DATA-MIGRATION-CONTRACT.txt and /lifeos/DATA-CONTRACT-v1.json for portable data and migration rules, and /lifeos/NATIVE-RELEASE-MANIFEST.txt for the one-click download and release-artifact contract. The platform download center is /lifeos/downloads.html.

Current prototype: tasks, habits, goals, manual expenses/subscriptions, study/career items, reminders, document references, JSON backup/import and PWA shell. No native package, Flutter codebase, native notifications, accounts or cloud sync have been delivered yet. Do not use the prototype for highly sensitive data.