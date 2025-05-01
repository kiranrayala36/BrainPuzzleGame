
# 🧩 Brain Puzzle Game App

A React Native puzzle game built with Expo, featuring fun drag-and-drop challenges, level progression, sound effects, scoring system, and more.

## 🚀 Tech Stack

| Technology         | Description                          |
|-------------------|--------------------------------------|
| React Native       | Mobile development framework         |
| Expo               | Framework for rapid app development |
| TypeScript         | Type-safe code                       |
| React Navigation   | Screen navigation                    |
| React Context API  | Global state management              |
| react-native-sound | Sound effects                        |
| Lottie / Confetti  | Animations & visual feedback         |

## 🛠️ Installation Guide

Follow these steps to run the app locally:

1. **Clone the repository**
```bash
git clone https://github.com/your-username/puzzle-game.git
cd puzzle-game
```

2. **Install dependencies**
```bash
npm install
```

3. **Start Expo server**
```bash
npm start
```

4. **Run on device**
- Scan the QR code using the **Expo Go** app on Android or iOS  
- Or use a simulator:  
  ```bash
  npm run android  # For Android emulator  
  npm run ios      # For iOS simulator (macOS only)
  ```

## 🎮 Features

- 8+ Unique Puzzle Levels  
- Drag-and-drop mechanics  
- Score & time tracking  
- Matching logic  
- Level selection screen  
- Settings (sound/music toggle)  
- Animated modals for level completion  
- Persistent progress with React Context

## 📂 Folder Structure

```
src/
│
├── components/         # Reusable UI components (TopBar, Modal, etc.)
├── context/            # Game state management (GameContext)
├── levels/             # Level screens (Level1 to Level8)
├── hooks/              # Custom React hooks
├── screens/            # Menu, LevelSelection, Achievements
├── utils/              # Utility functions (sound, animation, etc.)
├── assets/             # Images, sounds
├── App.tsx             # Root app setup
```

## 📌 Notes

- Ensure you have **Node.js**, **npm**, and **Expo CLI** installed.  
- Tested on real device: Samsung M31 (Android)

---

Made with ❤️ using React Native & Expo
