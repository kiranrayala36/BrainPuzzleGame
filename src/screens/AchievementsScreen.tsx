import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { useGame } from '../context/GameContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import confetti from '../../assets/confetti1.json';

const screenWidth = Dimensions.get('window').width;

const iconMap: { [title: string]: string } = {
  'First Level Complete': 'trophy',
  '3-Star Master': 'star',
  'Completed 5 Levels': 'layers',
  'Perfect Score': 'sparkles',
};

const AchievementsScreen = () => {
  const { achievements, resetStars } = useGame();
  const confettiRef = useRef<LottieView>(null);
  const prevAchievements = useRef<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  const allAchievements = [
    'First Level Complete',
    '3-Star Master',
    'Completed 5 Levels',
    'Perfect Score',
  ];

  useEffect(() => {
    const newUnlocked = achievements.filter(
      (a) => !prevAchievements.current.includes(a)
    );

    if (newUnlocked.length > 0) {
      setShowConfetti(true);
      confettiRef.current?.reset();
      confettiRef.current?.play();

      // Hide confetti after 3 seconds
      setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
    }

    prevAchievements.current = achievements;
  }, [achievements]);

  const confirmReset = () => {
    Alert.alert('Reset Achievements', 'Are you sure you want to reset all achievements?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => resetStars(),
      },
    ]);
  };

  const data = allAchievements.map((title) => ({
    title,
    unlocked: achievements.includes(title),
  }));

  return (
    <LinearGradient colors={['#E3F2FD', '#BBDEFB']} style={styles.container}>
      <Text style={styles.title}>🏆 Achievements</Text>

      <FlatList
        data={data}
        keyExtractor={(item) => item.title}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => <AchievementItem achievement={item} />}
      />

      <Pressable style={styles.resetButton} onPress={confirmReset}>
        <Icon name="refresh-circle-outline" size={24} color="#FFF" />
        <Text style={styles.resetButtonText}>Reset Achievements</Text>
      </Pressable>

      {/* ✅ Confetti visible only when triggered */}
      {showConfetti && (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <LottieView
            ref={confettiRef}
            source={confetti}
            autoPlay={false}
            loop={false}
            style={{ flex: 1, zIndex: 10 }}
          />
        </View>
      )}
    </LinearGradient>
  );
};

const AchievementItem = ({ achievement }: { achievement: { title: string; unlocked: boolean } }) => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (achievement.unlocked) {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [achievement.unlocked]);

  return (
    <Animated.View style={[styles.achievementCard, { transform: [{ scale }] }]}>
      <LinearGradient
        colors={achievement.unlocked ? ['#C8E6C9', '#A5D6A7'] : ['#ECEFF1', '#CFD8DC']}
        style={styles.cardContent}
      >
        <Icon
          name={iconMap[achievement.title] || 'medal'}
          size={30}
          color={achievement.unlocked ? '#2E7D32' : '#90A4AE'}
          style={styles.icon}
        />
        <View style={styles.textWrapper}>
          <Text style={styles.achievementTitle}>{achievement.title}</Text>
          <Text style={[styles.statusText, { color: achievement.unlocked ? '#388E3C' : '#78909C' }]}>
            {achievement.unlocked ? 'Unlocked 🎉' : 'Locked 🔒'}
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#0D47A1',
    marginBottom: 20,
  },
  achievementCard: {
    borderRadius: 14,
    marginBottom: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 14,
  },
  icon: {
    marginRight: 15,
  },
  textWrapper: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#37474F',
  },
  statusText: {
    fontSize: 14,
    marginTop: 4,
  },
  resetButton: {
    position: 'absolute',
    bottom: 20,
    left: screenWidth * 0.1,
    right: screenWidth * 0.1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EF5350',
    padding: 14,
    borderRadius: 10,
    elevation: 6,
  },
  resetButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default AchievementsScreen;
