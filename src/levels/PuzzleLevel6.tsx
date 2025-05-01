import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useGame } from '../context/GameContext';
import Draggable from '../components/Draggable';
import { playSuccessSound, playFailSound } from '../utils/SoundManager';
import { LevelLayout } from '../components/LevelLayout';
import { useLevelComplete } from '../hooks/useLevelComplete';
import LevelCompletionModal from '../components/LevelCompletionModal';

const { width, height } = Dimensions.get('window');
const BOTTOM_BAR_HEIGHT = 100;

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Level6'>;
type Position = { x: number; y: number };

const imageMap = {
  ball1: require('../../assets/level6/ball_red.png'),
  ball1_new: require('../../assets/level6/ball_orange.png'),
  ball2: require('../../assets/level6/ball_red.png'),
  ball2_new: require('../../assets/level6/ball_orange.png'),
  ball3: require('../../assets/level6/ball_blue.png'),
  ball3_new: require('../../assets/level6/ball_purple.png'),
  ball4: require('../../assets/level6/ball_blue.png'),
  ball4_new: require('../../assets/level6/ball_purple.png'),
  apple1: require('../../assets/level6/apple_green.png'),
  apple1_new: require('../../assets/level6/apple_purple.png'),
  apple2: require('../../assets/level6/apple_green.png'),
  apple2_new: require('../../assets/level6/apple_purple.png'),
  key1: require('../../assets/level6/key_yellow.png'),
  key1_new: require('../../assets/level6/key_red.png'),
  key2: require('../../assets/level6/key_yellow.png'),
  key2_new: require('../../assets/level6/key_red.png'),
  decoy1: require('../../assets/level6/decoy_star.png'),
  decoy2: require('../../assets/level6/decoy_bomb.png'),
};

type ImageKey = keyof typeof imageMap;

const generateRandomPosition = () => ({
  x: Math.random() * (width - 100),
  y: Math.random() * (height - 200 - BOTTOM_BAR_HEIGHT) + 50,
});

const getNewImage = (id: string) => {
  const newKey = `${id}_new` as ImageKey;
  return imageMap[newKey] || null;
};

const initialObjects = [
  { id: 'ball1', matchId: 'ball2', color: 'red' },
  { id: 'ball2', matchId: 'ball1', color: 'red' },
  { id: 'ball3', matchId: 'ball4', color: 'blue' },
  { id: 'ball4', matchId: 'ball3', color: 'blue' },
  { id: 'apple1', matchId: 'apple2', color: 'green' },
  { id: 'apple2', matchId: 'apple1', color: 'green' },
  { id: 'key1', matchId: 'key2', color: 'yellow' },
  { id: 'key2', matchId: 'key1', color: 'yellow' },
  { id: 'decoy1', matchId: '', color: 'none' },
  { id: 'decoy2', matchId: '', color: 'none' },
];

export default function PuzzleLevel6() {
  const navigation = useNavigation<NavigationProp>();
  const { score, setScore, isSoundOn } = useGame();
  const { handleLevelCompletion } = useLevelComplete(6);

  const [startTime] = useState(Date.now());
  const [matched, setMatched] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ time: 0, score: 0, stars: 0, progress: 0 });
  const [objects, setObjects] = useState(() =>
    initialObjects.map(obj => ({
      ...obj,
      image: imageMap[obj.id as ImageKey],
      initial: generateRandomPosition(),
    }))
  );

  // Random reposition every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setObjects(prev =>
        prev.map(obj => ({
          ...obj,
          initial: generateRandomPosition(),
        }))
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const calculateStars = (time: number, score: number) => {
    if (score >= 20 && time <= 20) return 3;
    if (score >= 15) return 2;
    return 1;
  };

  const handleDrop = useCallback((position: Position, id: string) => {
    const dragged = objects.find(o => o.id === id);
    if (!dragged || dragged.color === 'none') {
      playFailSound(isSoundOn);
      setScore(Math.max(score - 2, 0));
      return;
    }

    const target = objects.find(o => o.id === dragged.matchId);
    if (!target) {
      playFailSound(isSoundOn);
      return;
    }

    const alreadyMatched = matched.includes(id) || matched.includes(target.id);
    if (alreadyMatched) {
      playFailSound(isSoundOn);
      return;
    }

    const dx = position.x - target.initial.x;
    const dy = position.y - target.initial.y;
    const distance = Math.hypot(dx, dy);

    if (distance < 50 && dragged.color === target.color) {
      const newMatched = [...matched, id, target.id];
      setMatched(newMatched);
      setScore(score + 3);
      playSuccessSound(isSoundOn);

      setObjects(prev =>
        prev.map(obj =>
          newMatched.includes(obj.id)
            ? { ...obj, image: getNewImage(obj.id) }
            : obj
        )
      );

      const totalMatches = objects.filter(o => o.matchId && o.color !== 'none').length;
      if (newMatched.length === totalMatches) {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        const finalScore = (newMatched.length / 2) * 3 + 5; // Matches + Bonus
        const stars = calculateStars(timeSpent, finalScore);
        const progress = Math.min(100, (timeSpent / 30) * 100);

        handleLevelCompletion({ timeTaken: timeSpent, scoreEarned: finalScore });

        setModalData({ time: timeSpent, score: finalScore, stars, progress: Math.floor(progress) });
        setShowModal(true);
      }
    } else {
      playFailSound(isSoundOn);
      setScore(Math.max(score - 2, 0));
    }
  }, [objects, matched, isSoundOn, startTime, handleLevelCompletion]);

  const handleNext = () => {
    setShowModal(false);
    navigation.navigate('Level7');
  };

  return (
    <LevelLayout level={6} title="Hard Mode: Color Match">
      {objects.map(obj => 
        !matched.includes(obj.id) && (
          <Draggable
            key={obj.id}
            id={obj.id}
            image={obj.image}
            initialPosition={obj.initial}
            onDrop={pos => handleDrop(pos, obj.id)}
            style={styles.draggable}
          />
        )
      )}
      <LevelCompletionModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        data={modalData}
        onNextLevel={handleNext}
      />
    </LevelLayout>
  );
}

const styles = StyleSheet.create({
  draggable: {
    width: 70,
    height: 70,
    position: 'absolute',
    zIndex: 2,
  },
});
