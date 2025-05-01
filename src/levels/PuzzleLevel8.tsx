import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useGame } from '../context/GameContext';
import { useLevelComplete } from '../hooks/useLevelComplete';
import { LevelLayout } from '../components/LevelLayout';
import LevelCompletionModal from '../components/LevelCompletionModal';
import { playSuccessSound } from '../utils/SoundManager';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Level8'>;

const { width } = Dimensions.get('window');
const TILE_SIZE = width / 4 - 10; // Adjust tile size

const initialTiles = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "blank"];

const tileImages: Record<string, any> = {
  "1": require('../../assets/level8/1.jpg'),
  "2": require('../../assets/level8/2.jpg'),
  "3": require('../../assets/level8/3.jpg'),
  "4": require('../../assets/level8/4.jpg'),
  "5": require('../../assets/level8/5.jpg'),
  "6": require('../../assets/level8/6.jpg'),
  "7": require('../../assets/level8/7.jpg'),
  "8": require('../../assets/level8/8.jpg'),
  "9": require('../../assets/level8/9.jpg'),
  "10": require('../../assets/level8/10.jpg'),
  "11": require('../../assets/level8/11.jpg'),
  "12": require('../../assets/level8/12.jpg'),
  "13": require('../../assets/level8/13.jpg'),
  "14": require('../../assets/level8/14.jpg'),
  "15": require('../../assets/level8/15.jpg'),
  "blank": require('../../assets/level8/blank.jpg'), // Use a blank image for the empty space
};

export default function PuzzleLevel8() {
  const navigation = useNavigation<NavigationProp>();
  const { score, setScore, isSoundOn } = useGame();
  const { handleLevelCompletion } = useLevelComplete(8);

  const [tiles, setTiles] = useState<string[]>(shuffleTiles([...initialTiles]));
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ time: 0, score: 0, stars: 0, progress: 0 });
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (isSolved()) {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const finalScore = score + 10;
      const stars = calculateStars(timeSpent, finalScore);
      const progress = Math.min(100, (timeSpent / 60) * 100);

      playSuccessSound(isSoundOn);
      handleLevelCompletion({ timeTaken: timeSpent, scoreEarned: finalScore });

      setModalData({
        time: timeSpent,
        score: finalScore,
        stars,
        progress: Math.floor(progress),
      });
      setShowModal(true);
    }
  }, [tiles]);

  // Function to shuffle tiles
  function shuffleTiles(array: string[]): string[] {
    let newArr = array.slice();
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  }

  // Check if puzzle is solved
  function isSolved() {
    return tiles.join() === initialTiles.join();
  }

  // Handle tile move logic
  function moveTile(index: number) {
    const blankIndex = tiles.indexOf("blank");
    const isAdjacent = [1, -1, 4, -4].some(offset => index + offset === blankIndex &&
      Math.abs(Math.floor(index / 4) - Math.floor(blankIndex / 4)) <= 1 &&
      Math.abs(index % 4 - blankIndex % 4) <= 1);

    if (isAdjacent) {
      const newTiles = [...tiles];
      [newTiles[index], newTiles[blankIndex]] = [newTiles[blankIndex], newTiles[index]];
      setTiles(newTiles);
    }
  }

  // Calculate stars based on time and score
  function calculateStars(timeSpent: number, scoreEarned: number) {
    if (scoreEarned >= 40 && timeSpent <= 40) return 3;
    if (scoreEarned >= 30) return 2;
    return 1;
  }

  const handleNextLevel = () => {
    setShowModal(false);
    navigation.navigate('Level9'); // Update if needed
  };

  return (
    <LevelLayout level={8} title="Slide Puzzle: Arrange the Tiles">
      <View style={styles.grid}>
        {tiles.map((tile, index) => (
          <TouchableOpacity key={index} onPress={() => moveTile(index)}>
            <Image
              source={tileImages[tile]}
              style={[styles.tile, tile === 'blank' && styles.blankTile]} // Apply blank tile style for opacity
            />
          </TouchableOpacity>
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
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    margin: 2,
    borderRadius: 4,
  },
  blankTile: {
    opacity: 0, // Set the opacity of the blank tile to 0
  },
});


