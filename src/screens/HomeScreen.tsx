import React from 'react';
import { View, Text, StyleSheet, Pressable, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import Icon from 'react-native-vector-icons/Ionicons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <ImageBackground
      source={require('../../assets/background1.png')} // Optional: add a soft background
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.title}>🧩 Puzzle Quest</Text>

        <Pressable style={styles.button} onPress={() => navigation.navigate('LevelSelection')}>
          <Icon name="play" size={22} color="#FFF" />
          <Text style={styles.buttonText}>Play</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={() => navigation.navigate('Achievements')}>
          <Icon name="trophy" size={22} color="#FFF" />
          <Text style={styles.buttonText}>Achievements</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={() => navigation.navigate('Settings')}>
          <Icon name="settings" size={22} color="#FFF" />
          <Text style={styles.buttonText}>Settings</Text>
        </Pressable>

        <Text style={styles.footer}>Made with ❤️ by Kiran</Text>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 250,
    paddingHorizontal: 30,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 248, 225, 0.45)', // semi-transparent background
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#5D4037',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8D6E63',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 20,
    width: '80%',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 10,
  },
  footer: {
    marginTop: 60,
    color: '#A1887F',
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default HomeScreen;
