import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAppContext, IP_ADDRESS } from '../context/AppContext';

type Module = {
  id: string | number;
  category: string;
  question: string;
  answer: string;
};

export default function LearnScreen() {
  const [activeCategory, setActiveCategory] = useState<string>('Getting Started');
  const [expandedId, setExpandedId] = useState<string | number | null>(null);

  // Lessons are prefetched at app startup by AppContext — no fetch here.
  const { modules, modulesLoading: loading } = useAppContext();
  const { currentUserEmail } = useAppContext();

  // Filter out live items from the state array by the active tab choice
  const filteredData: Module[] = modules.filter((item: Module) => item.category === activeCategory);
  const categories = ['Getting Started', 'Glossary', 'GSE Basics', 'Scams'];

  const toggleExpand = (id: string | number) => {
    const opening = expandedId !== id;
    setExpandedId(opening ? id : null);

    // Mark this module as completed the first time it's opened.
    // Safe to call every time it's opened — the backend only counts it once.
    if (opening && currentUserEmail) {
      fetch(`http://${IP_ADDRESS}:8081/api/academic/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUserEmail, moduleId: String(id) }),
      }).catch((err: Error) => {
        // Non-critical — don't interrupt reading if this fails.
        console.log('Module completion tracking error:', err.message);
      });
    }
  };

  // LOADING SKELETON LOADER SCREEN
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2563EB" />
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
              style={[
                styles.card,
                isExpanded && styles.expandedCard
              ]}
            >
              <View style={styles.cardHeader}>
                {/* Left checkbox box icon - now styled in Blue theme */}
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

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0A111E', 
    paddingTop: 60, 
    paddingHorizontal: 20 
  },
  headerTitle: { 
    color: '#FFF', 
    fontSize: 22, 
    fontWeight: 'bold', 
    textAlign: 'center',
    marginBottom: 25 
  },
  tabScrollContainer: { 
    alignItems: 'center'
  },
  tabButton: { 
    marginRight: 24,
    position: 'relative',
    paddingBottom: 6
  },
  tabText: { 
    color: '#52627A', 
    fontWeight: '600', 
    fontSize: 15 
  },
  activeTabText: { 
    color: '#FFF' 
  },
  activeIndicatorLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#2563EB' 
  },
  scrollbarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
    paddingHorizontal: 4
  },
  arrowIcon: {
    color: '#475569',
    fontSize: 10
  },
  scrollbarTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#1E293B',
    borderRadius: 2,
    marginHorizontal: 10,
    position: 'relative'
  },
  scrollbarHandle: {
    position: 'absolute',
    left: 10,
    width: 140,
    height: '100%',
    backgroundColor: '#475569',
    borderRadius: 2
  },
  subtitleText: {
    color: '#475569',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30
  },
  questionsList: { 
    flex: 1 ,
    marginTop: 10
  },
  card: { 
    backgroundColor: '#111A2E', 
    padding: 18, 
    borderRadius: 14, 
    marginBottom: 14, 
    borderWidth: 1, 
    borderColor: '#1E293B',
  },
  expandedCard: { 
    borderColor: '#2563EB', 
    borderWidth: 1.5
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  boxIcon: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: '#2563EB', 
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  boxIconActive: {
    backgroundColor: '#0F265C' 
  },
  boxInner: {
    width: 8,
    height: 8,
    borderRadius: 1
  },
  boxInnerActive: {
    backgroundColor: '#2563EB' 
  },
  questionText: { 
    color: '#FFF', 
    fontSize: 14, 
    fontWeight: '600', 
    flex: 1,
    lineHeight: 20
  },
  chevronIcon: {
    color: '#475569',
    fontSize: 10,
    marginLeft: 10
  },
  answerContainer: {
    marginTop: 18,
    borderTopWidth: 1,
    borderColor: '#1E293B',
    paddingTop: 16
  },
  answerText: { 
    color: '#94A3B8', 
    fontSize: 13, 
    lineHeight: 22,
    marginBottom: 16
  },
  readMoreLink: {
    color: '#2563EB', 
    fontSize: 13,
    fontWeight: 'bold'
  }
});