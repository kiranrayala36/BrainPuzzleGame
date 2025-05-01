import React, { useMemo, memo } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const { width } = Dimensions.get('window');

const TOTAL_STARS = 3;

interface LevelCompletionModalProps {
  visible: boolean;
  onClose: () => void;
  data: {
    time: number;
    score: number;
    stars: number;
    progress: number;
  };
  onNextLevel: () => void;
}

const LevelCompletionModal = ({
  visible,
  onClose,
  data,
  onNextLevel,
}: LevelCompletionModalProps) => {
  const stars = useMemo(() => {
    return Array.from({ length: TOTAL_STARS }).map((_, i) => {
      const earned = i < data.stars;
      return (
        <View key={i}>
          <FontAwesome
            name="star"
            size={36}
            color={earned ? '#FFD700' : '#ccc'}
            style={styles.starIcon}
          />
        </View>
      );
    });
  }, [data.stars]);

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>🎉 Level Complete! 🎉</Text>
          <Text style={styles.modalText}>⏱ Time Taken: <Text style={styles.bold}>{data.time}s</Text></Text>
          <Text style={styles.modalText}>💯 Score: <Text style={styles.bold}>{data.score}</Text></Text>

          <Text style={[styles.modalText, { marginTop: 10 }]}>⭐ Stars Earned:</Text>
          <View style={styles.starsContainer}>
            {stars}
          </View>

          <Text style={styles.modalText}>📈 Progress: <Text style={styles.bold}>{data.progress.toFixed(1)}%</Text></Text>

          <Pressable
            style={({ pressed }) => [
              styles.nextButton,
              pressed && { transform: [{ scale: 0.96 }] },
            ]}
            onPress={() => {
              onClose();
              onNextLevel();
            }}
          >
            <Text style={styles.nextButtonText}>🚀 Next Level</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

// Use React.memo to avoid unnecessary re-renders
export default memo(LevelCompletionModal);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    width: width * 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 18,
    color: '#444',
    marginVertical: 5,
    textAlign: 'center',
  },
  bold: {
    fontWeight: 'bold',
    color: '#000',
  },
  starsContainer: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  starIcon: {
    marginHorizontal: 5,
  },
  nextButton: {
    marginTop: 25,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 3,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
});
