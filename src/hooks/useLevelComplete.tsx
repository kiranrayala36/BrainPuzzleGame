import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGame } from '../context/GameContext';

type Props = {
  timeTaken: number;
  scoreEarned: number;
};

export const useLevelComplete = (levelNumber: number) => {
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const navigation = useNavigation();
  const {
    setStarsForLevel,
  } = useGame();

  const handleLevelCompletion = async ({ timeTaken, scoreEarned }: Props) => {
    if (isLevelComplete) return;
    setIsLevelComplete(true);

    try {
      // ⭐ Save stars, score, and best time
      setStarsForLevel(levelNumber, timeTaken, scoreEarned);

      // 🔓 Unlock next level
      const currentCompleted = await AsyncStorage.getItem('completedLevel');
      const completedLevel = currentCompleted ? parseInt(currentCompleted, 10) : 1;

      if (levelNumber >= completedLevel) {
        await AsyncStorage.setItem('completedLevel', (levelNumber + 1).toString());
      }
    } catch (error) {
      console.error('Error handling level completion:', error);
    }
  };

  const goToNextLevel = () => {
    const nextLevel = `Level${levelNumber + 1}`;
    navigation.navigate(nextLevel as never);
  };

  return {
    handleLevelCompletion,
    isLevelComplete,
    goToNextLevel,
  };
};
