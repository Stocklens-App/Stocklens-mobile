import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, StatusBar } from 'react-native';
import Svg, { Rect, Circle, Line, G, ClipPath, Defs } from 'react-native-svg';
import { COLORS } from '../theme';

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
const INK = '#FFFFFF';
const GLASS = '#131A26';

type SplashScreenProps = {
  navigation: {
    replace: (screen: string, params?: Record<string, unknown>) => void;
  };
};

export default function SplashScreen({ navigation }: SplashScreenProps) {
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
      }).start(() => navigation.replace('Login'));
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
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  word: {
    marginTop: 26,
    fontSize: 34,
    fontWeight: '700',
    fontFamily: 'Georgia',
    letterSpacing: -1,
    color: COLORS.textMain,
  },
});