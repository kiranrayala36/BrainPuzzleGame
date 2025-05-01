import React, { useState, useRef } from 'react';
import { Animated, Image, PanResponder, StyleSheet, ViewStyle, ImageSourcePropType } from 'react-native';

type Position = {
  x: number;
  y: number;
};

interface DraggableProps {
  id?: string;
  image: ImageSourcePropType;
  style?: ViewStyle | ViewStyle[];
  onDrop?: (pos: Position) => void;
  onDragStart?: () => void;
  initialPosition?: Position;
  disabled?: boolean;
  rotate?: string;
}

const Draggable: React.FC<DraggableProps> = ({
  image,
  style,
  onDrop = () => {},
  onDragStart = () => {},
  initialPosition = { x: 0, y: 0 },
  disabled = false,
  rotate = '0deg',
}) => {
  const position = useRef({ ...initialPosition });
  const pan = useRef(new Animated.ValueXY(initialPosition)).current;
  const trailOpacity = useRef(new Animated.Value(1)).current;
  const [isDragging, setIsDragging] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,

      onPanResponderGrant: () => {
        if (!disabled) {
          onDragStart();
          setIsDragging(true);
          trailOpacity.setValue(1);
          pan.setOffset({
            x: position.current.x,
            y: position.current.y,
          });
          pan.setValue({ x: 0, y: 0 });
        }
      },

      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),

      onPanResponderRelease: (e, gesture) => {
        if (!disabled) {
          pan.flattenOffset();
          position.current.x += gesture.dx;
          position.current.y += gesture.dy;
          onDrop({ x: position.current.x, y: position.current.y });
          setIsDragging(false);

          // Fade out the trail effect after the drag
          Animated.timing(trailOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const animatedStyle = {
    transform: [
      ...pan.getTranslateTransform(),
      { rotate },
    ],
  };

  return (
    <Animated.View {...(!disabled ? panResponder.panHandlers : {})} style={[style, animatedStyle]}>
      {/* Cosmic Trail Effect */}
      {isDragging && (
        <Animated.View
          style={[
            styles.trail,
            { opacity: trailOpacity, transform: [...pan.getTranslateTransform(), { rotate }] },
          ]}
        >
          <Image source={image} style={{ width: 40, height: 40 }} resizeMode="contain" />
        </Animated.View>
      )}

      <Image source={image} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  trail: {
    position: 'absolute',
    zIndex: -1,
  },
});

export default Draggable;
