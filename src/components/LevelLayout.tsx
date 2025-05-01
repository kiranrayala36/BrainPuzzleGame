// components/LevelLayout.tsx
import React, { ReactNode } from 'react';
import { View, StyleSheet, SafeAreaView, Text, Alert } from 'react-native';
import Constants from 'expo-constants';
import { TopBar } from './TopBar';
import { BottomBar } from './BottomBar';
import { useNavigation } from '@react-navigation/native';
import { useGame } from '../context/GameContext';

type LevelLayoutProps = {
  level: number;
  title: string;
  children: ReactNode;
};

export const LevelLayout = ({
  level,
  title,
  children,
}: LevelLayoutProps) => {
  const navigation = useNavigation();
  const { score, hint } = useGame();

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleSettings = () => {
    navigation.navigate('Settings' as never);
  };

  const handleHintPress = () => {
    Alert.alert('Hint', hint || 'Try interacting with the elements!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopBar
        level={level}
        totalLevels={12}
        //onBackPress={handleBackPress}
        onSettings={handleSettings}
        levelType="easy"
      />

      <Text style={styles.title}>{title}</Text>

      <View style={styles.content}>{children}</View>

      <BottomBar
        score={score}
        hint={hint}
        onHintPress={handleHintPress}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1',
    paddingTop: Constants.statusBarHeight,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginVertical: 20,
    fontWeight: 'bold',
    color: '#5D4037',
  },
  content: {
    flex: 1,
  },
});
