import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAppContext, api } from '../context/AppContext';
import { useTheme } from '../theme/ThemeContext';
import { ThemeColors } from '../theme';

type Module = {
  id: string | number;
  category: string;
  question: string;
  answer: string;
};

export default function LearnScreen() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [activeCategory, setActiveCategory] = useState<string>('Getting Started');
  const [expandedId, setExpandedId] = useState<string | number | null>(null);

  // Lessons are prefetched at app startup by AppContext — no fetch here.
  const { modules, modulesLoading: loading, currentUserEmail } = useAppContext();

  // Filter out live items from the state array by the active tab choice
  const filteredData: Module[] = modules.filter((item: Module) => item.category === activeCategory);
  const categories = ['Getting Started', 'Glossary', 'GSE Basics', 'Scams'];

  const toggleExpand = (id: string | number) => {
    const opening = expandedId !== id;
    setExpandedId(opening ? id : null);

    // Mark this module as completed the first time it's opened.
    // Safe to call every time — the backend only counts it once.
    if (opening && currentUserEmail) {
      api
        .post('/api/academic/complete', {
          email: currentUserEmail,
          moduleId: Number(id),
        })
        .catch((err: any) => {
          // Non-critical — don't interrupt reading if this fails.
          console.log('Module completion error:', err.response?.status, err.response?.data);
        });
    }
  };

  // LOADING SKELETON LOADER SCREEN
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.subtitleText, { marginTop: 15 }]}>Connecting to StockLens network...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Learn</Text>

      {/* HORIZONTAL SLIDING CATEGORIES */}
      <View style={{ height: 40, marginBottom: 5 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContainer}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => {
                setActiveCategory(cat);
                setExpandedId(null);
              }}
              style={styles.tabButton}
            >
              <Text style={[styles.tabText, activeCategory === cat && styles.activeTabText]}>
                {cat}
              </Text>
              {activeCategory === cat && <View style={styles.activeIndicatorLine} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ACCORDION CARDS LIST CONTAINER */}
      <ScrollView style={styles.questionsList} showsVerticalScrollIndicator={false}>
        {filteredData.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.9}
              onPress={() => toggleExpand(item.id)}
              style={[styles.card, isExpanded && styles.expandedCard]}
            >
              <View style={styles.cardHeader}>
                {/* Left checkbox box icon */}
                <View style={[styles.boxIcon, isExpanded && styles.boxIconActive]}>
                  <View style={[styles.boxInner, isExpanded && styles.boxInnerActive]} />
                </View>

                <Text style={styles.questionText}>{item.question}</Text>

                <Text style={styles.chevronIcon}>{isExpanded ? '▲' : '▼'}</Text>
              </View>

              {/* EXPANDABLE BODY CONTENT */}
              {isExpanded && (
                <View style={styles.answerContainer}>
                  <Text style={styles.answerText}>{item.answer}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
      paddingTop: 60,
      paddingHorizontal: 20,
    },
    headerTitle: {
      color: c.textMain,
      fontSize: 22,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 25,
    },
    tabScrollContainer: {
      alignItems: 'center',
    },
    tabButton: {
      marginRight: 24,
      position: 'relative',
      paddingBottom: 6,
    },
    tabText: {
      color: c.textSecondary,
      fontWeight: '600',
      fontSize: 15,
    },
    activeTabText: {
      color: c.textMain,
    },
    activeIndicatorLine: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 2,
      backgroundColor: c.primary,
    },
    subtitleText: {
      color: c.textSecondary,
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 30,
    },
    questionsList: {
      flex: 1,
      marginTop: 10,
    },
    card: {
      backgroundColor: c.surface,
      padding: 18,
      borderRadius: 14,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: c.border,
    },
    expandedCard: {
      borderColor: c.primary,
      borderWidth: 1.5,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    boxIcon: {
      width: 20,
      height: 20,
      borderWidth: 1.5,
      borderColor: c.primary,
      borderRadius: 4,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    boxIconActive: {
      backgroundColor: c.surface,
    },
    boxInner: {
      width: 8,
      height: 8,
      borderRadius: 1,
    },
    boxInnerActive: {
      backgroundColor: c.primary,
    },
    questionText: {
      color: c.textMain,
      fontSize: 14,
      fontWeight: '600',
      flex: 1,
      lineHeight: 20,
    },
    chevronIcon: {
      color: c.textSecondary,
      fontSize: 10,
      marginLeft: 10,
    },
    answerContainer: {
      marginTop: 18,
      borderTopWidth: 1,
      borderColor: c.border,
      paddingTop: 16,
    },
    answerText: {
      color: c.textSecondary,
      fontSize: 13,
      lineHeight: 22,
      marginBottom: 16,
    },
  });