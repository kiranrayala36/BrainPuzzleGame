import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Animated,
  Easing,
  Dimensions,
  BackHandler,
  ToastAndroid,
  ImageBackground,
} from 'react-native';
import { useNavigation, useIsFocused, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGame } from '../context/GameContext';
import { RootStackParamList } from '../../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'LevelSelection'>;

const LevelSelectionScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const scrollRef = useRef<ScrollView>(null);
  const [completedLevel, setCompletedLevel] = useState(1);
  const [backPressCount, setBackPressCount] = useState(0);
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;
  const buttonSize = isTablet ? width * 0.12 : width * 0.2;
  const rowWidth = isTablet ? '85%' : '75%';

  const levelRows = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [10, 11, 12],
  ];

  const { stars, resetStars } = useGame();

  const loadCompletedLevel = async () => {
    try {
      const stored = await AsyncStorage.getItem('completedLevel');
      const level = stored ? Number(stored) : 1;
      setCompletedLevel(level);

      setTimeout(() => {
        const rowIndex = Math.floor((level - 1) / 3);
        scrollRef.current?.scrollTo({ y: rowIndex * 120, animated: true });
      }, 300);
    } catch (e) {
      console.error('Error loading progress', e);
    }
  };

  useEffect(() => {
    if (isFocused) loadCompletedLevel();
  }, [isFocused]);

  // Handle Android back button: double press to exit
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (backPressCount === 0) {
          setBackPressCount(1);
          ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
          setTimeout(() => setBackPressCount(0), 2000); // Reset after 2 sec
          return true;
        } else {
          BackHandler.exitApp();
          return true;
        }
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [backPressCount])
  );

  const handleLevelPress = async (level: number) => {
    if (level <= completedLevel + 1) {
      if (level >= 9) {
        Alert.alert("Coming Soon!", "This level is coming soon. Stay tuned!");
      } else {
        navigation.navigate(`Level${level}` as never);
        if (level >= completedLevel) {
          const next = level + 1;
          await AsyncStorage.setItem('completedLevel', next.toString());
          setCompletedLevel(next);
        }
      }
    }
  };

  const confirmReset = () => {
    Alert.alert('Reset Progress', 'Are you sure you want to reset your progress?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('completedLevel');
          await resetStars();
          setCompletedLevel(1);
          scrollRef.current?.scrollTo({ y: 0, animated: true });
        },
      },
    ]);
  };

  const navigateToAchievements = () => {
    navigation.navigate('Achievements');
  };

  return (
    <ImageBackground
      source={require('../../assets/background1.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Select a Level</Text>
        <ScrollView ref={scrollRef} contentContainerStyle={styles.levelList}>
          {levelRows.map((row, i) => (
            <View key={i} style={[styles.levelRow, { width: rowWidth }]}>
              {row.map((level) => {
                const isUnlocked = level <= completedLevel + 1;
                const isCompleted = level < completedLevel;
                return (
                  <LevelButton
                    key={level}
                    level={level}
                    isUnlocked={isUnlocked}
                    isCompleted={isCompleted}
                    onPress={handleLevelPress}
                    size={buttonSize}
                    stars={stars[level] || 0}
                  />
                );
              })}
            </View>
          ))}
        </ScrollView>

        <View style={styles.buttonsContainer}>
          <Pressable style={styles.settingsButton} onPress={() => navigation.navigate('Settings' as never)}>
            <Icon name="settings-outline" size={24} color="#5D4037" />
          </Pressable>
          <Pressable style={[styles.settingsButton, { backgroundColor: '#FFCDD2' }]} onPress={confirmReset}>
            <Icon name="refresh-outline" size={24} color="#C62828" />
          </Pressable>
          <Pressable style={styles.settingsButton} onPress={navigateToAchievements}>
            <Icon name="trophy-outline" size={24} color="#5D4037" />
          </Pressable>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const LevelButton = ({
  level,
  isUnlocked,
  isCompleted,
  onPress,
  size,
  stars,
}: {
  level: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  onPress: (level: number) => void;
  size: number;
  stars: number;
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const starScales = Array(3).fill(0).map(() => useRef(new Animated.Value(0)).current);

  useEffect(() => {
    if (isCompleted) {
      Animated.stagger(
        100,
        starScales.map((anim) =>
          Animated.spring(anim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 10,
            bounciness: 10,
          })
        )
      ).start();
    }
  }, [isCompleted]);

  const pulse = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.1,
        duration: 150,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 150,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Pressable
      onPress={() => {
        if (isUnlocked) {
          pulse();
          onPress(level);
        }
      }}
      disabled={!isUnlocked}
    >
      <Animated.View
        style={[
          styles.levelButton,
          {
            width: size,
            height: size,
            backgroundColor: isUnlocked ? '#8D6E63' : '#B0BEC5',
            transform: [{ scale }],
          },
        ]}
      >
        <Text style={styles.levelText}>{level}</Text>
        {!isUnlocked && <Icon name="lock-closed" size={18} color="#FFF" style={styles.lockIcon} />}
        {isCompleted && (
          <View style={styles.starsContainer}>
            {[...Array(3)].map((_, i) => (
              <Animated.View key={i} style={{ transform: [{ scale: starScales[i] }] }}>
                <Icon name="star" size={16} color={stars > i ? '#FFD700' : '#B0BEC5'} />
              </Animated.View>
            ))}
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 70,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 248, 225, 0.55)', // semi-transparent background
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#5D4037',
    marginBottom: 20,
  },
  levelList: {
    alignItems: 'center',
    paddingBottom: 120,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  levelButton: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  levelText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  lockIcon: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 10,
    paddingBottom: 150,
  },
  settingsButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D7CCC8',
    padding: 15,
    borderRadius: 10,
  },
});

export default LevelSelectionScreen;
