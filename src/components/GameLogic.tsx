// GameLogic.tsx
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { BottomBar } from './BottomBar';

const GameLogic = () => {
  const [score, setScore] = useState(0);
  const [hint, setHint] = useState('Drag the dog onto the box to proceed.');

  const increaseScore = () => {
    setScore(prev => prev + 10);
  };

  const handleHintPress = () => {
    console.log('Hint used!');
    // Optional: mark hint as used, reduce score, etc.
  };

  return (
    <View style={styles.container}>
      <View style={styles.gameArea}>
        <Text style={styles.title}>Puzzle Game</Text>
        <Text style={styles.score}>Score: {score}</Text>
        <Button title="Increase Score" onPress={increaseScore} />
      </View>

      <BottomBar score={score} hint={hint} onHintPress={handleHintPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1',
  },
  gameArea: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  score: {
    fontSize: 18,
    marginBottom: 12,
  },
});

export default GameLogic;
