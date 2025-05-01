import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Dimensions,
  Pressable,
  Image,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import Draggable from '../components/Draggable';
import { useGame } from '../context/GameContext';
import { playSuccessSound, playFailSound } from '../utils/SoundManager';
import { LevelLayout } from '../components/LevelLayout';
import { playBackgroundMusic, stopBackgroundMusic } from '../utils/MusicManager';
import LevelCompletionModal from '../components/LevelCompletionModal';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Level3'>;

export default function PuzzleLevel3() {
  const navigation = useNavigation<NavigationProp>();
  const [objectFound, setObjectFound] = useState(false);
  const [objectUncovered, setObjectUncovered] = useState(false);
  const [showNextLevel, setShowNextLevel] = useState(false);
  const [objectPosition, setObjectPosition] = useState({
    x: width * 0.5,
    y: height * 0.45,
  });

  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ time: 0, score: 0, stars: 0, progress: 0 });
  const [startTime] = useState(Date.now());

  const chestUnlockAnim = useRef(new Animated.Value(1)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;

  const { score, setScore, isSoundOn, setStarsForLevel } = useGame();

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

  const handleTap = useCallback((objectNumber: number) => {
    if (objectNumber === 3 && !objectFound) {
      setObjectFound(true);
      Alert.alert('You found the hidden map!', 'Now drag it to the treasure area!');
    } else {
      Alert.alert('Nothing here!', 'Try another object.');
    }
  }, [objectFound]);

  const handleMapDrop = (pos: { x: number; y: number }) => {
    const targetX = width * 0.5;
    const targetY = height * 0.2;
    const targetRadius = 100;

    const dx = pos.x - targetX;
    const dy = pos.y - targetY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < targetRadius) {
      if (!objectUncovered) {
        setObjectUncovered(true);
        setScore(score + 10);
        playSuccessSound(isSoundOn);
        setShowNextLevel(true);

        // Snapping to the target location
        setObjectPosition({ x: targetX, y: targetY });

        const endTime = Date.now();
        const timeSpent = Math.floor((endTime - startTime) / 1000);
        const stars = calculateStars(timeSpent);

        setModalData({
          time: timeSpent,
          score: score + 10,
          stars,
          progress: Math.min(100, (timeSpent / 30) * 100),
        });

        // Update stars for Level 3
        setStarsForLevel(3, timeSpent, score + 10);

        animateChestUnlock();
        showModalAnimation();
        setShowModal(true);
      }
    } else {
      playFailSound(isSoundOn);
      Alert.alert('Wrong place!', 'Drop the map on the glowing spot.');
    }
  };

  const handleNextLevel = () => {
    setShowModal(false);
    navigation.navigate('Level4');
  };

  const calculateStars = (timeSpent: number) => {
    if (timeSpent <= 20) return 3;
    if (timeSpent <= 30) return 2;
    return 1;
  };

  useEffect(() => {
    playBackgroundMusic();
    return () => {
      stopBackgroundMusic();
    };
  }, []);

  return (
    <LevelLayout level={3} title="Find and deliver the treasure map!">
      {/* Background */}
      <Image source={require('../../assets/forest_scene.png')} style={styles.background} resizeMode="cover" />

      {/* Target drop area (only appears after map is found) */}
      {objectFound && !objectUncovered && (
        <Image source={require('../../assets/target.png')} style={styles.target} />
      )}

      {/* Pressable objects */}
      {!objectFound &&
        [1, 2, 3, 4].map((object) => (
          <Pressable
            key={object}
            style={[styles.object, { left: width * 0.18 * object - 23 }]}
            onPress={() => handleTap(object)}
          >
            <Image source={require('../../assets/rock.png')} style={{ width: 80, height: 80 }} />
          </Pressable>
        ))}

      {/* Draggable map */}
      {objectFound && !objectUncovered && (
        <Draggable
          image={require('../../assets/treasure_map.png')}
          initialPosition={objectPosition}
          style={styles.hiddenObject}
          onDrop={handleMapDrop}
        />
      )}

      {/* Modal */}
      {showModal && (
        <Animated.View style={[styles.modalContainer, { opacity: modalAnim }]}>
          <LevelCompletionModal
            visible={showModal}
            onClose={() => setShowModal(false)}
            data={modalData}
            onNextLevel={handleNextLevel}
          />
        </Animated.View>
      )}
    </LevelLayout>
  );
}

const styles = StyleSheet.create({
  background: {
    width: '100%',
    height: height * 0.7,
    position: 'absolute',
    top: 0,
    zIndex: 1,
  },
  target: {
    width: 50,
    height: 50,
    position: 'absolute',
    left: width * 0.5 - 25,
    top: height * 0.2,
    zIndex: 2,
  },
  object: {
    position: 'absolute',
    top: height * 0.49,
    zIndex: 3,
  },
  hiddenObject: {
    width: 80,
    height: 80,
    position: 'absolute',
    zIndex: 4,
  },
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10,
  },
});
