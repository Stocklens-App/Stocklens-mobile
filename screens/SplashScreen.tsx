import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, StatusBar } from 'react-native';
import Svg, { Rect, Circle, Line, G, ClipPath, Defs } from 'react-native-svg';
import { ThemeColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';

const ARect = Animated.createAnimatedComponent(Rect);
const ACircle = Animated.createAnimatedComponent(Circle);
const AG = Animated.createAnimatedComponent(G);

const BASE = 830;
const BARS = [
  { x: 223, top: 618, fill: '#A6D0F7' },
  { x: 375, top: 525, fill: '#3478F6' },
  { x: 527, top: 411, fill: '#A6D0F7' },
  { x: 679, top: 300, fill: '#3478F6' },
];
const L = { cx: 450, cy: 477, r: 181, ring: 42, inner: 158 };

type SplashScreenProps = {
  onFinish: () => void; 
};

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);

  // Logo ink: white magnifier reads on dark; on light we darken it so it stays visible.
  const INK = isDark ? '#FFFFFF' : '#0F1B2D';
  const GLASS = isDark ? '#131A26' : '#EAF1FB';

  const grow  = useRef(BARS.map(() => new Animated.Value(0))).current;
  const lens  = useRef(new Animated.Value(0)).current;
  const scan  = useRef(new Animated.Value(0)).current;
  const word  = useRef(new Animated.Value(0)).current;
  const stage = useRef(new Animated.Value(0)).current;
  const exit  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(stage, {
      toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true,
    }).start();

    Animated.stagger(110, grow.map(v =>
      Animated.timing(v, {
        toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: false,
      })
    )).start();

    Animated.sequence([
      Animated.delay(560),
      Animated.timing(lens, {
        toValue: 1, duration: 520, easing: Easing.out(Easing.quad), useNativeDriver: false,
      }),
    ]).start();

    Animated.sequence([
      Animated.delay(1150),
      Animated.timing(scan, {
        toValue: 1, duration: 950, easing: Easing.out(Easing.quad), useNativeDriver: false,
      }),
    ]).start();

    Animated.sequence([
      Animated.delay(1250),
      Animated.timing(word, {
        toValue: 1, duration: 550, easing: Easing.out(Easing.cubic), useNativeDriver: true,
      }),
    ]).start();

    const t = setTimeout(() => {
      Animated.timing(exit, {
        toValue: 0, duration: 420, useNativeDriver: true,
      }).start(() => onFinish());
    }, 2800);

    return () => clearTimeout(t);
  }, []);

  const barRects = (keyPrefix: string) =>
    BARS.map((b, i) => (
      <ARect
        key={`${keyPrefix}${i}`}
        x={b.x}
        width={122}
        rx={18}
        fill={b.fill}
        y={grow[i].interpolate({ inputRange: [0, 1], outputRange: [BASE, b.top] })}
        height={grow[i].interpolate({ inputRange: [0, 1], outputRange: [0, BASE - b.top] })}
      />
    ));

  return (
    <Animated.View style={[styles.root, { opacity: exit }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <Animated.View
        style={{
          opacity: stage,
          transform: [{ scale: stage.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) }],
        }}
      >
        <Svg width={168} height={168} viewBox="0 0 1024 1024">
          <Defs>
            <ClipPath id="lensClip">
              <Circle cx={L.cx} cy={L.cy} r={L.inner} />
            </ClipPath>
          </Defs>

          {barRects('b')}

          <AG opacity={lens}>
            <Circle cx={L.cx} cy={L.cy} r={L.inner} fill={GLASS} />
            <G clipPath="url(#lensClip)">{barRects('c')}</G>
            <Line
              x1={578} y1={611} x2={787} y2={806}
              stroke={INK} strokeWidth={52} strokeLinecap="round"
            />
            <Circle cx={L.cx} cy={L.cy} r={L.r} fill="none" stroke={INK} strokeWidth={L.ring} />
          </AG>

          <ACircle
            cx={L.cx}
            cy={L.cy}
            fill="none"
            stroke="#3478F6"
            strokeWidth={10}
            r={scan.interpolate({ inputRange: [0, 1], outputRange: [L.r, 340] })}
            opacity={scan.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.55, 0] })}
          />
        </Svg>
      </Animated.View>

      <Animated.Text
        style={[
          styles.word,
          {
            opacity: word,
            transform: [{ translateY: word.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
          },
        ]}
      >
        StockLens
      </Animated.Text>
    </Animated.View>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: c.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    word: {
      marginTop: 26,
      fontSize: 34,
      fontWeight: '700',
      fontFamily: 'Georgia',
      letterSpacing: -1,
      color: c.textMain,
    },
  });