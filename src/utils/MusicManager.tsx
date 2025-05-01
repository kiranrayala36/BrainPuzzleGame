// utils/MusicManager.ts
import { Audio, AVPlaybackStatus } from 'expo-av';

let backgroundSound: Audio.Sound | null = null;

export const playBackgroundMusic = async () => {
  try {
    if (!backgroundSound) {
      backgroundSound = new Audio.Sound();
      await backgroundSound.loadAsync(require('../../assets/sounds/ingame-music.mp3'));
      await backgroundSound.setIsLoopingAsync(true);
    }

    const status: AVPlaybackStatus = await backgroundSound.getStatusAsync();
    if (status.isLoaded && !status.isPlaying) {
      await backgroundSound.playAsync();
    }
  } catch (error) {
    console.log('Error playing background music:', error);
  }
};

export const stopBackgroundMusic = async () => {
  try {
    if (backgroundSound) {
      const status: AVPlaybackStatus = await backgroundSound.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await backgroundSound.stopAsync();
      }
    }
  } catch (error) {
    console.log('Error stopping background music:', error);
  }
};
