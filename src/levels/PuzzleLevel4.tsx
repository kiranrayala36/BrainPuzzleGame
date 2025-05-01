import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  Alert,
  Vibration,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useGame } from '../context/GameContext';
import Draggable from '../components/Draggable';
import { LevelLayout } from '../components/LevelLayout';
import { playSuccessSound, playFailSound } from '../utils/SoundManager';
import { useLevelComplete } from '../hooks/useLevelComplete';
import LevelCompletionModal from '../components/LevelCompletionModal';

const { width, height } = Dimensions.get('window');
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Level4'>;

export default function PuzzleLevel4() {
  const navigation = useNavigation<NavigationProp>();
  const { score, setScore, isSoundOn, setStarsForLevel } = useGame();

  const [planksPlaced, setPlanksPlaced] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [startTime] = useState(Date.now());
  const [modalData, setModalData] = useState({ time: 0, score: 0, stars: 0, progress: 0 });

  const {
    handleLevelCompletion,
    isLevelComplete
  } = useLevelComplete(4);

  const bounceAnim = useRef(new Animated.Value(1)).current;

  const targetZones = [
    { x: width * 0.48, y: height * 0.25 },
    { x: width * 0.43, y: height * 0.276 },
    { x: width * 0.37, y: height * 0.29 },
  ];

  const handlePlankDrop = (pos: { x: number; y: number }, index: number) => {
    const target = targetZones[index];
    const dx = pos.x - target.x;
    const dy = pos.y - target.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 60) {
      playSuccessSound(isSoundOn);
      setPlanksPlaced((prev) => {
        const newCount = prev + 1;
        if (newCount === targetZones.length && !isLevelComplete) {
          animateSuccess();
          const endTime = Date.now();
          const timeSpent = Math.floor((endTime - startTime) / 1000);
          const earnedScore = 10;
          const updatedScore = score + earnedScore;

          setScore(updatedScore);
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
        }
        return newCount;
      });
    } else {
      playFailSound(isSoundOn);
      Vibration.vibrate(400);
    }
  };

  const animateSuccess = () => {
    Animated.sequence([
      Animated.spring(bounceAnim, { toValue: 1.2, useNativeDriver: true }),
      Animated.spring(bounceAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  const calculateStars = (timeSpent: number, scoreEarned: number) => {
    if (scoreEarned >= 10 && timeSpent <= 20) return 3;
    if (scoreEarned >= 8) return 2;
    return 1;
  };

  const handleNextLevel = () => {
    setShowModal(false);
    navigation.navigate('Level5');
  };

  return (
    <LevelLayout
      level={4}
      title="Fix the broken bridge with planks!"
    >
      <Image
        source={require('../../assets/bridge_broken.png')}
        style={styles.background}
        resizeMode="contain"
      />

      {targetZones.map((zone, index) => (
        <Image
          key={index}
          source={require('../../assets/bridge_gap.png')}
          style={[
            styles.gap,
            {
              left: zone.x,
              top: zone.y,
              transform: [{ rotate: '45deg' }],
            },
          ]}
        />
      ))}

      {[0, 1, 2].map((index) => (
        <Draggable
          key={index}
          image={require('../../assets/plank.png')}
          initialPosition={{ x: width * 0.1 * (index + 5), y: height * 0.6 }}
          style={styles.plank}
          onDrop={(pos) => handlePlankDrop(pos, index)}
          rotate="45deg"
          disabled={isLevelComplete}
        />
      ))}

      <Animated.View style={[styles.successIndicator, { transform: [{ scale: bounceAnim }] }]}>
        {/* Could add animation or celebratory icon */}
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
  background: {
    width: '100%',
    height: height * 0.4,
    position: 'absolute',
    top: height * 0.1,
    zIndex: 1,
  },
  gap: {
    width: 90,
    height: 22,
    position: 'absolute',
    zIndex: 2,
  },
  plank: {
    width: 100,
    height: 22,
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
    zIndex: 3,
  },
  successIndicator: {
    position: 'absolute',
    top: height * 0.05,
    left: width * 0.4,
    width: 60,
    height: 60,
    zIndex: 100,
  },
});
