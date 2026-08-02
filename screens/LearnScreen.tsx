import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

  const { modules, modulesLoading: loading, currentUserEmail } = useAppContext();

  const filteredData: Module[] = modules.filter((item: Module) => item.category === activeCategory);
  const categories = ['Getting Started', 'Glossary', 'GSE Basics', 'Scams'];

  const toggleExpand = (id: string | number) => {
    const opening = expandedId !== id;
    setExpandedId(opening ? id : null);

    if (opening && currentUserEmail) {
      api
        .post('/api/academic/complete', {
          email: currentUserEmail,
          moduleId: Number(id),
        })
        .catch((err: any) => {
          console.log('Module completion error:', err.response?.status, err.response?.data);
        });
    }
  };

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
      <Text style={styles.headerSubtitle}>Master the market, one lesson at a time.</Text>

      {/* Category tabs */}
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContainer}>
          {categories.map((cat) => {
            const active = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => {
                  setActiveCategory(cat);
                  setExpandedId(null);
                }}
                style={[styles.tabChip, active && styles.tabChipActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, active && styles.activeTabText]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Accordion cards */}
      <ScrollView
        style={styles.questionsList}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
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
                <View style={[styles.boxIcon, isExpanded && styles.boxIconActive]}>
                  {isExpanded && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
                </View>

                <Text style={styles.questionText}>{item.question}</Text>

                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.textSecondary}
                />
              </View>

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
      paddingTop: 10,
      paddingHorizontal: 20,
    },
    headerTitle: {
      color: c.textMain,
      fontSize: 28,
      fontWeight: '800',
      letterSpacing: -0.5,
      textAlign: 'center',
    },
    headerSubtitle: {
      color: c.textSecondary,
      fontSize: 15,
      marginTop: 8,
      marginBottom: 20,
    },
    tabBar: {
      marginBottom: 16,
    },
    tabScrollContainer: {
      gap: 8,
      paddingRight: 8,
    },
    tabChip: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 999,
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    tabChipActive: {
      backgroundColor: c.primary,
      borderColor: c.primary,
    },
    tabText: {
      color: c.textSecondary,
      fontWeight: '600',
      fontSize: 13,
    },
    activeTabText: {
      color: '#FFFFFF',
    },
    subtitleText: {
      color: c.textSecondary,
      fontSize: 14,
      textAlign: 'center',
    },
    questionsList: {
      flex: 1,
    },
    card: {
      backgroundColor: c.surface,
      padding: 16,
      borderRadius: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: c.border,
    },
    expandedCard: {
      borderColor: c.primary,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    boxIcon: {
      width: 22,
      height: 22,
      borderWidth: 1.5,
      borderColor: c.border,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    boxIconActive: {
      backgroundColor: c.primary,
      borderColor: c.primary,
    },
    questionText: {
      color: c.textMain,
      fontSize: 14,
      fontWeight: '600',
      flex: 1,
      lineHeight: 20,
    },
    answerContainer: {
      marginTop: 16,
      borderTopWidth: 1,
      borderColor: c.border,
      paddingTop: 14,
    },
    answerText: {
      color: c.textSecondary,
      fontSize: 13,
      lineHeight: 22,
    },
  });