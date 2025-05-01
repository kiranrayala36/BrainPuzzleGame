import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useGame } from '../context/GameContext';
import { LevelLayout } from '../components/LevelLayout';
import { useLevelComplete } from '../hooks/useLevelComplete';
import LevelCompletionModal from '../components/LevelCompletionModal';
import { playSuccessSound, playFailSound } from '../utils/SoundManager';
import Draggable from '../components/Draggable';

const { width, height } = Dimensions.get('window');
const PLAY_AREA_HEIGHT = height - 160; // TopBar + BottomBar ~80 each

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Level7'>;

const planets = [
  { id: 'mercury', image: require('../../assets/level7/mercury.png'), order: 1 },
  { id: 'venus', image: require('../../assets/level7/venus.png'), order: 2 },
  { id: 'earth', image: require('../../assets/level7/earth.png'), order: 3 },
  { id: 'mars', image: require('../../assets/level7/mars.png'), order: 4 },
  { id: 'moon', image: require('../../assets/level7/moon.png'), order: 5 },
  { id: 'jupiter', image: require('../../assets/level7/jupiter.png'), order: 6 },
  { id: 'saturn', image: require('../../assets/level7/saturn.png'), order: 7 },
  { id: 'neptune', image: require('../../assets/level7/neptune.png'), order: 8 },
];

const decoys = [
  { id: 'sun', image: require('../../assets/level7/sun.png') },
  { id: 'asteroid', image: require('../../assets/level7/asteroid.png') },
];

export default function PuzzleLevel7() {
  const navigation = useNavigation<NavigationProp>();
  const { score, setScore, isSoundOn } = useGame();
  const [startTime] = useState(Date.now());
  const currentOrderRef = useRef(1); // Use useRef to track currentOrder
  const [matched, setMatched] = useState<string[]>([]); // Keeps track of matched planets
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ time: 0, score: 0, stars: 0, progress: 0 });

  const { handleLevelCompletion } = useLevelComplete(7);

  useEffect(() => {
    if (currentOrderRef.current > planets.length) {
      // All planets matched, calculate final score and time
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const finalScore = score + 10; // Bonus for completing level
      const stars = calculateStars(timeSpent, finalScore);
      const progress = Math.min(100, (timeSpent / 40) * 100);

      handleLevelCompletion({ timeTaken: timeSpent, scoreEarned: finalScore });

      setModalData({
        time: timeSpent,
        score: finalScore,
        stars,
        progress: Math.floor(progress),
      });

      setShowModal(true);
    }
  }, [currentOrderRef.current]); // Depend on `currentOrderRef.current` to track level completion

  const handleDrop = (id: string) => {
    const planet = planets.find(p => p.id === id);
    if (!planet) return;

    if (planet.order === currentOrderRef.current) {
      // Correct planet placed in the correct order
      playSuccessSound(isSoundOn);
      const newScore = score + 5;
      setScore(newScore);
      setMatched(prev => [...prev, id]); // Planet disappears when matched

      currentOrderRef.current += 1; // Move to the next planet
    } else {
      // Incorrect planet placed
      playFailSound(isSoundOn);
      setScore(Math.max(score - 3, 0)); // Deduct 3 points

      // Reset the level
      currentOrderRef.current = 1; // Reset the order to 1
      setMatched([]); // Clear matched planets

      // Optionally, you can add a visual reset or trigger an alert/animation here
    }
  };

  const calculateStars = (timeSpent: number, scoreEarned: number) => {
    if (scoreEarned >= 40 && timeSpent <= 30) return 3;  // Max stars if time is quick and score is high
    if (scoreEarned >= 30) return 2; // 2 stars if score is moderate
    return 1; // 1 star for lower performance
  };

  const handleNextLevel = () => {
    setShowModal(false);
    navigation.navigate('Level8');
  };

  const getRandomPosition = () => ({
    x: Math.random() * (width - 100) + 10,
    y: Math.random() * (PLAY_AREA_HEIGHT - 100) + 10,
  });

  const getRandomRotation = () => `${Math.floor(Math.random() * 360)}deg`;

  return (
    <LevelLayout level={7} title="Cosmic Code: Drag in Sequence">
      {/* Play Area starts */}
      <View style={styles.playArea}>
        {planets.map(planet => (
          !matched.includes(planet.id) && (
            <Draggable
              key={planet.id}
              id={planet.id}
              image={planet.image}
              initialPosition={getRandomPosition()}
              rotate={getRandomRotation()}
              onDrop={() => handleDrop(planet.id)}
              style={styles.draggable}
            />
          )
        ))}

        {decoys.map(decoy => (
          <Draggable
            key={decoy.id}
            id={decoy.id}
            image={decoy.image}
            initialPosition={getRandomPosition()}
            rotate={getRandomRotation()}
            onDrop={() => playFailSound(isSoundOn)}
            style={styles.draggable}
          />
        ))}
      </View>

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
  playArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  draggable: {
    width: 80,
    height: 80,
    position: 'absolute',
  },
});
