import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Pressable,
  Share,
  SafeAreaView,
  Linking,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { useGame } from '../context/GameContext';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { isSoundOn, setIsSoundOn, isMusicOn, setIsMusicOn } = useGame();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState('en');

  const handleSupport = () => {
    Linking.openURL('mailto:support@example.com');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Check out this awesome puzzle game! 🎮',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Sound</Text>
        <Switch value={isSoundOn} onValueChange={setIsSoundOn} />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Music</Text>
        <Switch
          value={isMusicOn}
          onValueChange={setIsMusicOn}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Notifications</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Language</Text>
        <Picker
          selectedValue={language}
          style={styles.picker}
          onValueChange={(itemValue) => setLanguage(itemValue)}
        >
          <Picker.Item label="English" value="en" />
          <Picker.Item label="Spanish" value="es" />
          <Picker.Item label="French" value="fr" />
        </Picker>
      </View>

      <Pressable style={styles.button} onPress={handleSupport}>
        <Text style={styles.buttonText}>Contact Support</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={handleShare}>
        <Text style={styles.buttonText}>Share the Game</Text>
      </Pressable>

      <View style={styles.socials}>
        <Text style={styles.socialTitle}>Follow Us:</Text>
        <View style={styles.links}>
          <Pressable onPress={() => Linking.openURL('https://instagram.com')} style={{ marginRight: 15 }}>
            <Text style={styles.link}>Instagram</Text>
          </Pressable>
          <Pressable onPress={() => Linking.openURL('https://youtube.com')}>
            <Text style={styles.link}>YouTube</Text>
          </Pressable>
        </View>
      </View>

      <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FFF8E1',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5D4037',
    marginTop:10,
    marginBottom: 20,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  label: {
    fontSize: 18,
    color: '#5D4037',
  },
  picker: {
    width: 150,
    height: 60,
  },
  button: {
    backgroundColor: '#8D6E63',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
  },
  socials: {
    marginTop: 30,
    alignItems: 'center',
  },
  socialTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5D4037',
    marginBottom: 10,
  },
  links: {
    flexDirection: 'row',
  },
  link: {
    fontSize: 16,
    color: '#8D6E63',
  },
  backButton: {
    marginTop: 30,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#8D6E63',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
});
