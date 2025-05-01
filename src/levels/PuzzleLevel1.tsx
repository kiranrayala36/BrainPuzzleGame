import React, { useState, useRef } from 'react';
import {
  Text,
  View,
  Image,
  Animated,
  StyleSheet,
  Dimensions,
  Pressable,
  Vibration,
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Level1'>;

export default function PuzzleLevel1() {
  const [dogOnBox, setDogOnBox] = useState(false);
  const [dogPosition, setDogPosition] = useState({ x: width * 0.5, y: height * 0.4 });
  const [startTime] = useState(Date.now());
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ time: 0, score: 0, stars: 0, progress: 0 });
  
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const dogBounceAnim = useRef(new Animated.Value(1)).current;

  const navigation = useNavigation<NavigationProp>();
  const { score, setScore, isSoundOn, setStarsForLevel } = useGame();

  const {
    handleLevelCompletion,
    isLevelComplete
  } = useLevelComplete(1); // No combo logic passed here

  const handleDogDrop = (pos: { x: number; y: number }) => {
    const dogWidth = 140;
    const dogHeight = 140;
    const clampedX = Math.min(Math.max(pos.x, 0), width - dogWidth);
    const clampedY = Math.min(Math.max(pos.y, 0), height - dogHeight);
    const dogCenterX = clampedX + dogWidth / 2;
    const dogCenterY = clampedY + dogHeight / 2;

    const boxWidth = 180;
    const boxHeight = 120;
    const boxCenterX = width * 0.3 + boxWidth / 2;
    const boxCenterY = height * 0.25 + boxHeight / 2;

    const dx = dogCenterX - boxCenterX;
    const dy = dogCenterY - boxCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const threshold = 200;
    const isDogOnBox = distance <= threshold;

    setDogOnBox(isDogOnBox);
    setDogPosition({ x: clampedX, y: clampedY });

    if (isDogOnBox) {
      animateDogOnBox();
    }
  };

  const animateDogOnBox = () => {
    Animated.sequence([
      Animated.spring(dogBounceAnim, { toValue: 1.2, useNativeDriver: true }),
      Animated.spring(dogBounceAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  const handleBoneTap = () => {
    Animated.sequence([
      Animated.spring(bounceAnim, { toValue: 1.2, useNativeDriver: true }),
      Animated.spring(bounceAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();

    if (dogOnBox && !isLevelComplete) {
      const endTime = Date.now();
      const timeSpent = Math.floor((endTime - startTime) / 1000);
      const earnedScore = 10;
      const updatedScore = score + earnedScore;
      
      setScore(updatedScore);
      playSuccessSound(isSoundOn);
      const stars = calculateStars(timeSpent, earnedScore);
      const progress = Math.min(100, (timeSpent / 30) * 100);

      setStarsForLevel(1, timeSpent, earnedScore);
      handleLevelCompletion({ timeTaken: timeSpent, scoreEarned: updatedScore });
      
      setModalData({
        time: timeSpent,
        score: updatedScore,
        stars,
        progress: Math.floor(progress),
      });

      setShowModal(true);
    } else if (!dogOnBox) {
      playFailSound(isSoundOn);
      Vibration.vibrate(500);
    }
    
  };
  
  const calculateStars = (timeSpent: number, scoreEarned: number) => {
    if (scoreEarned >= 10 && timeSpent <= 20) return 3;
    if (scoreEarned >= 8) return 2;
    return 1;
  };

  const handleNextLevel = () => {
    setShowModal(false);
    navigation.navigate('Level2');
  };
  return (
    <LevelLayout
      level={1}
      title="Help the dog get the bone!"
    >
      <Draggable
        image={require('../../assets/dog.png')}
        style={styles.dog}
        initialPosition={dogPosition}
        onDrop={handleDogDrop}
        disabled={dogOnBox}
        rotate="0deg"
      />

      <Draggable
        image={require('../../assets/box.png')}
        style={styles.box}
        initialPosition={{ x: width * 0.3, y: height * 0.25 }}
        disabled={dogOnBox}
        rotate="0deg"
      />

      <Animated.View style={[styles.bone, { transform: [{ scale: bounceAnim }] }]}>
        <Pressable onPress={handleBoneTap} style={{ width: '100%', height: '100%' }}>
          <Image
            source={require('../../assets/bone.png')}
            style={{ width: 100, height: 100 }}
            resizeMode="contain"
          />
        </Pressable>
      </Animated.View>

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
  dog: {
    width: 140,
    height: 140,
    position: 'absolute',
  },
  box: {
    width: 180,
    height: 120,
    position: 'absolute',
  },
  bone: {
    width: 100,
    height: 100,
    position: 'absolute',
    top: height * 0.12,
    left: width * 0.38,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
