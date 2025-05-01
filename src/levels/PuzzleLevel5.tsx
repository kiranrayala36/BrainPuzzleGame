import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
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
const BOTTOM_BAR_HEIGHT = 80;

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Level5'>;
type Position = { x: number; y: number };

const generateRandomPosition = () => ({
  x: Math.random() * (width - 100),
  y: Math.random() * (height - 200 - BOTTOM_BAR_HEIGHT) + 30,
});

const objectsToMatch = [
  { id: 'key1', image: require('../../assets/key.png'), initial: generateRandomPosition(), matchId: 'key2' },
  { id: 'key2', image: require('../../assets/key.png'), initial: generateRandomPosition(), matchId: 'key1' },
  { id: 'ball1', image: require('../../assets/ball.png'), initial: generateRandomPosition(), matchId: 'ball2' },
  { id: 'ball2', image: require('../../assets/ball.png'), initial: generateRandomPosition(), matchId: 'ball1' },
  { id: 'apple1', image: require('../../assets/apple.png'), initial: generateRandomPosition(), matchId: 'apple2' },
  { id: 'apple2', image: require('../../assets/apple.png'), initial: generateRandomPosition(), matchId: 'apple1' },
  { id: 'sock1', image: require('../../assets/sock.png'), initial: generateRandomPosition(), matchId: 'sock2' },
  { id: 'sock2', image: require('../../assets/sock.png'), initial: generateRandomPosition(), matchId: 'sock1' },
];

export default function PuzzleLevel5() {
  const navigation = useNavigation<NavigationProp>();
  const { score, setScore, isSoundOn } = useGame();
  const [startTime] = useState(Date.now());
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ time: 0, score: 0, stars: 0, progress: 0 });

  const {
    handleLevelCompletion,
    isLevelComplete
  } = useLevelComplete(5);

  const handleDrop = (pos: Position, id: string) => {
    const droppedItem = objectsToMatch.find((obj) => obj.id === id);
    if (!droppedItem) return;

    const matchItem = objectsToMatch.find((obj) => obj.id === droppedItem.matchId);
    if (!matchItem || matchedPairs.includes(id) || matchedPairs.includes(matchItem.id)) return;

    const dx = pos.x - matchItem.initial.x;
    const dy = pos.y - matchItem.initial.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 80) {
      const newMatched = [...matchedPairs, id, matchItem.id];
      setMatchedPairs(newMatched);
      setScore(score + 5);
      playSuccessSound(isSoundOn);

      if (newMatched.length === objectsToMatch.length && !isLevelComplete) {
        const endTime = Date.now();
        const timeSpent = Math.floor((endTime - startTime) / 1000);
        const finalScore = score + 10; // Add bonus points
        setScore(finalScore);
        const progress = Math.min(100, (timeSpent / 30) * 100);
        const stars = calculateStars(timeSpent, finalScore);
        handleLevelCompletion({ timeTaken: timeSpent, scoreEarned: finalScore });

        setModalData({
          time: timeSpent,
          score: finalScore,
          stars,
          progress: Math.floor(progress),
        });

        setShowModal(true);
      }
    } else {
      playFailSound(isSoundOn);
      Alert.alert('Try again', 'Drag it closer to its pair.');
    }
  };

  const calculateStars = (timeSpent: number, scoreEarned: number) => {
    if (scoreEarned >= 10 && timeSpent <= 20) return 3;
    if (scoreEarned >= 8) return 2;
    return 1;
  };

  const handleNextLevel = () => {
    setShowModal(false);
    navigation.navigate('Level6');
  };

  return (
    <LevelLayout
      level={5}
      title="Match the identical objects"
      //showHint={true}
    >
      {objectsToMatch.map((item) =>
        !matchedPairs.includes(item.id) ? (
          <Draggable
            key={item.id}
            id={item.id}
            image={item.image}
            initialPosition={item.initial}
            onDrop={(pos) => handleDrop(pos, item.id)}
            style={styles.draggable}
          />
        ) : null
      )}

      <LevelCompletionModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        data={modalData}
        onNextLevel={handleNextLevel}
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
