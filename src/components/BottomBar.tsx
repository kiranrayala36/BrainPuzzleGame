import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

type BottomBarProps = {
  score: number;
  hint: string; // You can still pass this if needed elsewhere
  onHintPress?: () => void;
};

export const BottomBar = ({ score, hint, onHintPress }: BottomBarProps) => {
  return (
    <View style={styles.bottomBar}>
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>Score: {score}</Text>
      </View>

      <Pressable style={styles.hintButton} onPress={onHintPress}>
        <Icon name="bulb-outline" size={26} color="yellow" />
        <Text style={styles.hintButtonText}>Hint</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomBar: {
    width: '100%',
    height: 80,
    backgroundColor: '#5D4037',
    position: 'absolute',
    bottom: 0,
    left: 0,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },

  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  scoreText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8D6E63',
    padding: 8,
    borderRadius: 8,
  },

  hintButtonText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 6,
  },
});
