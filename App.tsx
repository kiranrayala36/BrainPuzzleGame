import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { GameProvider } from './src/context/GameContext';
import SettingsScreen from './src/screens/SettingsScreen';
import LevelSelectionScreen from './src/screens/LevelSelectionScreen';
import PuzzleLevel1 from './src/levels/PuzzleLevel1';
import PuzzleLevel2 from './src/levels/PuzzleLevel2';
import PuzzleLevel3 from './src/levels/PuzzleLevel3';
import PuzzleLevel4 from './src/levels/PuzzleLevel4';
import PuzzleLevel5 from './src/levels/PuzzleLevel5';
import PuzzleLevel6 from './src/levels/PuzzleLevel6';
import PuzzleLevel7 from './src/levels/PuzzleLevel7';
import PuzzleLevel8 from './src/levels/PuzzleLevel8';
import AchievementsScreen from './src/screens/AchievementsScreen';
import { playBackgroundMusic, stopBackgroundMusic } from './src/utils/MusicManager';
import { useGame } from './src/context/GameContext';
import HomeScreen from './src/screens/HomeScreen'; // New Home Screen

const Stack = createNativeStackNavigator();

function AppWrapper() {
  return (
    <GameProvider>
      <AppWithMusic />
    </GameProvider>
  );
}

function AppWithMusic() {
  const { isMusicOn } = useGame();

  useEffect(() => {
    if (isMusicOn) {
      playBackgroundMusic();
    } else {
      stopBackgroundMusic();
    }

    return () => {
      stopBackgroundMusic();
    };
  }, [isMusicOn]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="LevelSelection" component={LevelSelectionScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Level1" component={PuzzleLevel1} />
          <Stack.Screen name="Level2" component={PuzzleLevel2} />
          <Stack.Screen name="Level3" component={PuzzleLevel3} />
          <Stack.Screen name="Level4" component={PuzzleLevel4} />
          <Stack.Screen name="Level5" component={PuzzleLevel5} />
          <Stack.Screen name="Level6" component={PuzzleLevel6} />
          <Stack.Screen name="Level7" component={PuzzleLevel7} />
          <Stack.Screen name="Level8" component={PuzzleLevel8} />
          <Stack.Screen name="Achievements" component={AchievementsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AppWrapper;
