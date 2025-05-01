import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Pressable,
  Alert,
  Dimensions,
  Vibration,
  Animated,
  Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import Draggable from '../components/Draggable';
import { useGame } from '../context/GameContext';
import { playSuccessSound, playFailSound } from '../utils/SoundManager';
import { LevelLayout } from '../components/LevelLayout';
import { useLevelComplete } from '../hooks/useLevelComplete';
import LevelCompletionModal from '../components/LevelCompletionModal';

const { width, height } = Dimensions.get('window');
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Level2'>;

export default function PuzzleLevel2() {
  const navigation = useNavigation<NavigationProp>();
  const [keyFound, setKeyFound] = useState(false);
  const [keyOnChest, setKeyOnChest] = useState(false);
  const [chestUnlocked, setChestUnlocked] = useState(false);
  const [keyPosition, setKeyPosition] = useState({ x: width * 0.5, y: height * 0.25 });

  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ time: 0, score: 0, stars: 0, progress: 0 });
  const [startTime] = useState(Date.now());

  const chestUnlockAnim = useRef(new Animated.Value(1)).current; // Chest unlock animation
  const modalAnim = useRef(new Animated.Value(0)).current; // Modal animation
  const keyAnim = useRef(new Animated.Value(1)).current; // Key animation

  const { score, setScore, isSoundOn, setStarsForLevel } = useGame();
  const { handleLevelCompletion, isLevelComplete } = useLevelComplete(2);

  const animateChestUnlock = () => {
    Animated.sequence([
      Animated.spring(chestUnlockAnim, { toValue: 1.2, useNativeDriver: true }),
      Animated.spring(chestUnlockAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  const showModalAnimation = () => {
    Animated.timing(modalAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const animateKey = () => {
    Animated.sequence([
      Animated.spring(keyAnim, { toValue: 1.2, useNativeDriver: true }),
      Animated.spring(keyAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  // Handle key drop logic
  const handleKeyDrop = (pos: { x: number; y: number }) => {
    const chestX = width * 0.3;
    const chestY = height * 0.15;
    const chestWidth = 140;
    const chestHeight = 120;

    const keyCenterX = pos.x + 40;
    const keyCenterY = pos.y + 40;

    const chestCenterX = chestX + chestWidth / 2;
    const chestCenterY = chestY + chestHeight / 2;

    const dx = keyCenterX - chestCenterX;
    const dy = keyCenterY - chestCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const threshold = 80;

    if (distance <= threshold && !isLevelComplete) {
      const endTime = Date.now();
      const timeSpent = Math.floor((endTime - startTime) / 1000);
      const earnedScore = 10;
      const newScore = score + earnedScore;

      setKeyOnChest(true);
      setChestUnlocked(true);
      setScore(newScore);
      playSuccessSound(isSoundOn);

      const stars = calculateStars(timeSpent, earnedScore);
      const progress = Math.min(100, (timeSpent / 30) * 100);

      setStarsForLevel(2, timeSpent, earnedScore);
      handleLevelCompletion({ timeTaken: timeSpent, scoreEarned: newScore });

      setModalData({
        time: timeSpent,
        score: newScore,
        stars,
        progress: Math.floor(progress),
      });

      animateChestUnlock(); // Trigger chest unlock animation
      animateKey(); // Animate key when dropped on the chest
      showModalAnimation(); // Trigger modal animation
      setShowModal(true);
    } else {
      playFailSound(isSoundOn);
      Vibration.vibrate(500);
      Alert.alert('Try Again', 'Place the key on the chest!');
    }
  };

  const handleRockTap = (rockNumber: number) => {
    if (rockNumber === 2 && !keyFound) {
      setKeyFound(true);
      animateKey(); // Animate key when found
      Alert.alert('You found the key!', 'Now drag it to the chest!');
    } else {
      Alert.alert('Nothing here!', 'Try another rock.');
    }
  };

  const calculateStars = (timeSpent: number, scoreEarned: number) => {
    if (scoreEarned >= 10 && timeSpent <= 20) return 3;
    if (scoreEarned >= 8) return 2;
    return 1;
  };

  const handleNextLevel = () => {
    setShowModal(false);
    navigation.navigate('Level3');
  };

  return (
    <LevelLayout
      level={2}
      title="Find the key and unlock the chest!"
      //showNextLevel={false}
      //onNextLevel={handleNextLevel}
    >
      <Animated.Image
        source={chestUnlocked ? require('../../assets/open_chest.png') : require('../../assets/chest.png')}
        style={[styles.chest, { transform: [{ scale: chestUnlockAnim }] }]}
        resizeMode="contain"
      />

      {[1, 2, 3].map((rock) => (
        <Pressable
          key={rock}
          style={[styles.rock, { left: width * 0.2 * rock, top: height * 0.4 }]}
          onPress={() => handleRockTap(rock)}
        >
          <Image
            source={require('../../assets/rock.png')}
            style={{ width: 80, height: 80 }}
          />
        </Pressable>
      ))}

      {keyFound && (
        <Draggable
          image={require('../../assets/key.png')}
          initialPosition={keyPosition}
          style={StyleSheet.flatten([styles.key, { transform: [{ scale: keyAnim }] }])}  // Fix style merging
          onDrop={handleKeyDrop}
          disabled={keyOnChest}
        />
      )}

      <Animated.View
        style={[styles.modalContainer, { opacity: modalAnim }]}
      >
        <LevelCompletionModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          data={modalData}
          onNextLevel={handleNextLevel}
        />
      </Animated.View>
    </LevelLayout>
  );
}

const styles = StyleSheet.create({
  chest: {
    width: 140,
    height: 120,
    position: 'absolute',
    top: height * 0.15,
    left: width * 0.3,
    zIndex: 1,
  },
  rock: {
    position: 'absolute',
    zIndex: 2,
  },
  key: {
    width: 80,
    height: 80,
    position: 'absolute',
    zIndex: 3,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
});
