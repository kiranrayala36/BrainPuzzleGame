import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Combo Reward Logic
const comboRewards: { [key: number]: { points: number; achievement: string } } = {
  5: { points: 100, achievement: 'Combo Streak - 5' },
  10: { points: 200, achievement: 'Combo Streak - 10' },
  15: { points: 300, achievement: 'Combo Streak - 15' },
};

export function getRewardForCombo(comboCount: number) {
  const reward = comboRewards[comboCount];
  return reward || null;
}

type GameContextType = {
  score: number;
  setScore: (score: number) => void;
  isSoundOn: boolean;
  setIsSoundOn: (value: boolean) => void;
  isMusicOn: boolean;
  setIsMusicOn: (value: boolean) => void;
  stars: { [level: number]: number };
  setStarsForLevel: (level: number, timeTaken: number, score: number) => void;
  resetStars: () => void;
  levelScores: { [level: number]: number };
  setScoreForLevel: (level: number, newScore: number) => void;
  bestTimes: { [level: number]: number };
  achievements: string[];
  getGameProgress: () => number;
  comboStreak: number;
  incrementComboStreak: () => void;
  resetComboStreak: () => void;
  handleComboReward: (comboCount: number) => void;
  hint: string;
  setHint: (hint: string) => void; // Method to set hint
};

export const TOTAL_LEVELS = 12; // 🔁 Update this as your levels grow

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [score, setScore] = useState(0);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [isMusicOn, setIsMusicOn] = useState(true);
  const [stars, setStars] = useState<{ [level: number]: number }>({});
  const [levelScores, setLevelScores] = useState<{ [level: number]: number }>({});
  const [bestTimes, setBestTimes] = useState<{ [level: number]: number }>({});
  const [achievements, setAchievements] = useState<string[]>([]);
  const [comboStreak, setComboStreak] = useState(0);
  const [hint, setHint] = useState(''); // State for hint

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const [
          music,
          sound,
          storedStars,
          storedScores,
          storedTimes,
          storedAchievements,
          storedComboStreak,
          storedHint,  // Load stored hint
        ] = await Promise.all([
          AsyncStorage.getItem('music'),
          AsyncStorage.getItem('sound'),
          AsyncStorage.getItem('stars'),
          AsyncStorage.getItem('levelScores'),
          AsyncStorage.getItem('bestTimes'),
          AsyncStorage.getItem('achievements'),
          AsyncStorage.getItem('comboStreak'),
          AsyncStorage.getItem('hint'),  // Fetch stored hint
        ]);

        if (music !== null) setIsMusicOn(JSON.parse(music));
        if (sound !== null) setIsSoundOn(JSON.parse(sound));
        if (storedStars) setStars(JSON.parse(storedStars));
        if (storedScores) setLevelScores(JSON.parse(storedScores));
        if (storedTimes) setBestTimes(JSON.parse(storedTimes));
        if (storedAchievements) setAchievements(JSON.parse(storedAchievements));
        if (storedComboStreak) setComboStreak(JSON.parse(storedComboStreak));
        if (storedHint !== null) setHint(storedHint); // Set hint from storage
      } catch (error) {
        console.error('Error loading game preferences:', error);
      }
    };

    loadPreferences();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('music', JSON.stringify(isMusicOn));
    AsyncStorage.setItem('sound', JSON.stringify(isSoundOn));
  }, [isMusicOn, isSoundOn]);

  useEffect(() => {
    AsyncStorage.setItem('stars', JSON.stringify(stars));
  }, [stars]);

  useEffect(() => {
    AsyncStorage.setItem('levelScores', JSON.stringify(levelScores));
  }, [levelScores]);

  useEffect(() => {
    AsyncStorage.setItem('bestTimes', JSON.stringify(bestTimes));
  }, [bestTimes]);

  useEffect(() => {
    AsyncStorage.setItem('achievements', JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    AsyncStorage.setItem('comboStreak', JSON.stringify(comboStreak));
  }, [comboStreak]);

  useEffect(() => {
    AsyncStorage.setItem('hint', JSON.stringify(hint)); // Save hint to AsyncStorage
  }, [hint]);

  const calculateStars = (timeTaken: number, score: number): number => {
    let stars = 0;
    if (timeTaken <= 30) stars = 3;
    else if (timeTaken <= 60) stars = 2;
    else stars = 1;

    if (score >= 50) stars = Math.max(stars, 3);
    else if (score >= 30) stars = Math.max(stars, 2);
    else stars = Math.max(stars, 1);

    return stars;
  };

  const checkAchievements = (level: number, starsEarned: number) => {
    const newAchievements = new Set(achievements);

    if (level === 1) newAchievements.add('First Level Complete');
    if (starsEarned === 3) newAchievements.add('3-Star Master');
    if (Object.keys(stars).length >= 5) newAchievements.add('Completed 5 Levels');

    const perfectLevels = Object.values(stars).filter((s) => s === 3).length;
    if (perfectLevels === TOTAL_LEVELS) newAchievements.add('Perfect Score');

    setAchievements(Array.from(newAchievements));
  };

  const setStarsForLevel = (level: number, timeTaken: number, score: number) => {
    const starsEarned = calculateStars(timeTaken, score);

    setStars((prev) => ({
      ...prev,
      [level]: Math.max(prev[level] || 0, starsEarned),
    }));

    if (!bestTimes[level] || timeTaken < bestTimes[level]) {
      setBestTimes((prev) => ({
        ...prev,
        [level]: timeTaken,
      }));
    }

    checkAchievements(level, starsEarned);

    // Handle combo progression
    if (starsEarned === 3) {
      incrementComboStreak();
    } else {
      resetComboStreak();
    }
  };

  const setScoreForLevel = (level: number, newScore: number) => {
    setLevelScores((prev) => ({
      ...prev,
      [level]: Math.max(prev[level] || 0, newScore),
    }));
  };

  const resetStars = async () => {
    try {
      setStars({});
      setLevelScores({});
      setBestTimes({});
      setAchievements([]);
      setScore(0);
      setComboStreak(0);

      await AsyncStorage.multiRemove([
        'stars',
        'levelScores',
        'bestTimes',
        'achievements',
        'score',
        'comboStreak',
        'hint',  // Remove hint from storage as well
      ]);
    } catch (error) {
      console.error('Failed to reset game progress:', error);
    }
  };

  const getGameProgress = () => {
    const completed = Object.keys(stars).length;
    return Math.floor((completed / TOTAL_LEVELS) * 100);
  };

  // Combo Streak Management
  const incrementComboStreak = () => {
    setComboStreak((prev) => prev + 1); // Increment combo streak
    handleComboReward(comboStreak + 1); // Handle reward when combo streak increases
  };

  const resetComboStreak = () => {
    setComboStreak(0); // Reset combo streak after a break
  };

  const handleComboReward = (comboCount: number) => {
    const reward = getRewardForCombo(comboCount);
    if (reward) {
      // Award points or achievements for combo streak
      console.log(`Combo reward unlocked: ${reward.achievement}, ${reward.points} points`);
      setAchievements((prev) => [...prev, reward.achievement]);
      // You can also implement logic to award the player the reward points or do other actions.
    }
  };

  return (
    <GameContext.Provider
      value={{
        score,
        setScore,
        isSoundOn,
        setIsSoundOn,
        isMusicOn,
        setIsMusicOn,
        stars,
        setStarsForLevel,
        resetStars,
        levelScores,
        setScoreForLevel,
        bestTimes,
        achievements,
        getGameProgress,
        comboStreak,
        incrementComboStreak,
        resetComboStreak,
        handleComboReward,  // Make this available in the context
        hint,
        setHint,  // Make setHint available in the context
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
