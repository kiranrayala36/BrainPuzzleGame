import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, BackHandler, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'LevelSelection'>;

type TopBarProps = {
  level: number;
  totalLevels: number;
  onSettings: () => void;
  levelType: 'easy' | 'medium' | 'hard';
};

export const TopBar = ({ level, totalLevels, onSettings, levelType }: TopBarProps) => {
  const navigation = useNavigation<NavigationProp>();
  const [time, setTime] = useState<number>(0);
  const [timerDuration, setTimerDuration] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const validLevel = isNaN(level) ? 1 : level;
  const validTotalLevels = isNaN(totalLevels) ? 12 : totalLevels;
  const progress = (validLevel / validTotalLevels) * 100;

  useEffect(() => {
    let duration = 180;
    if (levelType === 'medium') duration = 120;
    else if (levelType === 'hard') duration = 60;
    setTimerDuration(duration);
  }, [levelType]);

  useEffect(() => {
    setTime(timerDuration);
  }, [level, timerDuration]);

  useEffect(() => {
    if (time > 0) {
      timerRef.current = setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current!);
    }

    return () => clearInterval(timerRef.current!);
  }, [time]);

  const handleBackPress = () => {
    Alert.alert('Exit Level', 'Are you sure you want to go back?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'OK', onPress: () => navigation.navigate('LevelSelection') },
    ]);
    return true;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, []);

  return (
    <View style={styles.topBar}>
      {/* Left: Back + Level */}
      <View style={styles.leftSection}>
        <Pressable onPress={handleBackPress} style={styles.iconButton}>
          <Icon name="chevron-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.levelText}>Lvl {validLevel}/{validTotalLevels}</Text>
      </View>

      {/* Center: Timer */}
      <View style={styles.centerSection}>
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
          </Text>
        </View>
      </View>

      {/* Right: Progress + Settings */}
      <View style={styles.rightSection}>
        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Pressable onPress={onSettings} style={styles.iconButton}>
          <Icon name="settings-outline" size={22} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    height: 70,
    width: '100%',
    backgroundColor: '#3E2723',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  leftSection: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  centerSection: {
    flex: 0.8,
    alignItems: 'flex-start',
  },
  rightSection: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  iconButton: {
    padding: 4,
    marginHorizontal: 4,
  },
  levelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5D4037',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginLeft: 30,
  },
  timerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  progressText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    marginRight: 6,
  },
  progressBar: {
    width: 60,
    height: 6,
    backgroundColor: '#B0BEC5',
    borderRadius: 5,
    overflow: 'hidden',
    marginRight: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
  },
});
