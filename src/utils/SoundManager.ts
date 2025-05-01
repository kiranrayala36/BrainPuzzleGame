// utils/SoundManager.ts
import { Audio } from 'expo-av';

let successSound: Audio.Sound | null = null;
let failSound: Audio.Sound | null = null;

export const playSuccessSound = async (isSoundOn: boolean) => {
  if (!isSoundOn) return;
  try {
    if (!successSound) {
      successSound = new Audio.Sound();
      await successSound.loadAsync(require('../../assets/sounds/success.mp3'));
    }
    await successSound.replayAsync();
  } catch (error) {
    console.log('Error playing success sound:', error);
  }
};

export const playFailSound = async (isSoundOn: boolean) => {
  if (!isSoundOn) return;
  try {
    if (!failSound) {
      failSound = new Audio.Sound();
      await failSound.loadAsync(require('../../assets/sounds/fail.mp3'));
    }
    await failSound.replayAsync();
  } catch (error) {
    console.log('Error playing fail sound:', error);
  }
};
