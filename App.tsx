import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Button,
} from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const TIMER_DURATION = 10;
const MAX_ATTEMPTS = 10;

const App = () => {
  const hue = useSharedValue<number>(Math.random() * 360);
  const brightness = useSharedValue<number>(0.5);
  const [tolerance, setTolerance] = useState<number>(20);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(TIMER_DURATION);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [attempts, setAttempts] = useState<number>(0);

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = `hsl(${hue.value}, ${
      brightness.value * 100
    }%, 50%)`;
    return {
      backgroundColor,
    };
  });

  const panGestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onActive: (event) => {
      hue.value = withTiming(Math.min(Math.max(hue.value + event.translationX, 0), 360));
      brightness.value = withTiming(Math.min(Math.max(brightness.value - event.translationY / 150, 0), 1));
    },
  });

  useEffect(() => {
    if (!isCorrect && !isTimerRunning) {
      setIsTimerRunning(true);
      setTimeLeft(TIMER_DURATION);
    }
  }, [isCorrect, isTimerRunning]);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      if (timeLeft > 0) {
        setTimeLeft(timeLeft - 1);
      } else {
        setIsTimerRunning(false);
        if (!isCorrect) {
          setScore(score - timeLeft * 10);
          setAttempts(attempts + 1);
        }
      }
    }, 1000);

    if (timeLeft === 0) {
      setIsTimerRunning(false);
      if (!isCorrect) {
        setScore(score - timeLeft * 10);
        setAttempts(attempts + 1);
      }
    }

    return () => clearInterval(timerInterval);
  }, [timeLeft]);

  const handleAnswerSubmit = () => {
    const targetBrightness = Math.abs(brightness.value - 0.5) * 2;
    const targetHue = hue.value;

    const distance =
      Math.abs(targetBrightness - brightness.value) * 100 +
      Math.abs(targetHue - hue.value);

    setIsCorrect(distance <= tolerance);
    setIsTimerRunning(false);

    if (distance <= tolerance) {
      const timeRemaining = timeLeft;
      setScore(score + timeRemaining * 10);
      setAttempts(attempts + 1);
    } else {
      setScore(score - timeLeft * 10);
      setAttempts(attempts + 1);
    }
  };

  const handleResetGame = () => {
    if (attempts < MAX_ATTEMPTS) {
      hue.value = Math.random() * 360;
      brightness.value = 0.5;
      setTolerance(20);
      setIsCorrect(false);
      setIsTimerRunning(false);
      setTimeLeft(TIMER_DURATION);
    } else {
      alert(`Congratulations, your final score is ${score}`);
      handleNewGame();
    }
  };

  const handleNewGame = () => {
    hue.value = Math.random() * 360;
    brightness.value = 0.5;
    setTolerance(20);
    setIsCorrect(false);
    setIsTimerRunning(false);
    setTimeLeft(TIMER_DURATION);
    setScore(0);
    setAttempts(0);
  };

  return (
    <View style={styles.container}>
      <View style={styles.gameContainer}>
        <View
          style={[
            styles.colorCircle,
            { backgroundColor: `hsl(${hue.value}, ${brightness.value * 100}%, 50%)` },
          ]}
        />
        <PanGestureHandler onGestureEvent={panGestureHandler}>
          <Animated.View style={[styles.colorCircle, animatedStyle]} />
        </PanGestureHandler>
      </View>
      <View style={styles.controlsContainer}>
        <View style={styles.controlsRow}>
          <Text>Hue</Text>
          <Text>{Math.round(hue.value)}</Text>
        </View>
        <View style={styles.controlsRow}>
          <Text>Brightness</Text>
          <Text>{Math.round(brightness.value * 100)}%</Text>
        </View>
        <View style={styles.controlsRow}>
          <Text>Tolerance</Text>
          <Text>{tolerance}</Text>
        </View>
      </View>
      {attempts >= MAX_ATTEMPTS ? (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackText}>
            Congratulations, your final score is {score}
          </Text>
          <Button title="New Game" onPress={handleNewGame} />
        </View>
      ) : isCorrect ? (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackText}>Correct!</Text>
          <Button title="Next" onPress={handleResetGame} />
          <Text style={styles.scoreText}>Score: {score}</Text>
        </View>
      ) : (
        <>
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{timeLeft}</Text>
          </View>
          <View style={styles.submitContainer}>
            <Button
              title="Submit"
              onPress={handleAnswerSubmit}
              disabled={!isTimerRunning}
            />
          </View>
          <Text style={styles.scoreText}>Score: {score}</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  colorCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginHorizontal: 10,
  },
  controlsContainer: {
    marginBottom: 40,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  submitContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  feedbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  feedbackText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default App;
