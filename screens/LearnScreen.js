import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { IP_ADDRESS } from '../context/AppContext';

export default function LearnScreen() {
  const [activeCategory, setActiveCategory] = useState('Getting Started');
  const [expandedId, setExpandedId] = useState(null);

  // Dynamic States for Cloud Database Integration
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  // NOTE: If testing via Expo Go on a physical phone, replace 'localhost' with your laptop's local IPv4 Address
  const API_URL = `http://${IP_ADDRESS}:8081/api/academic/all`;

  useEffect(() => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => {
        setModules(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error connecting to StockLens backend: ", error);
        setLoading(false);
      });
  }, []);

  // Filter out live items from the state array by the active tab choice
  const filteredData = modules.filter(item => item.category === activeCategory);
  const categories = ['Getting Started', 'Glossary', 'GSE Basics', 'Scams'];

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
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

      {/* SCROLLBAR TRACK WITH LEFT/RIGHT ARROWS */}
      <View style={styles.scrollbarContainer}>
        <Text style={styles.arrowIcon}>◀️</Text>
        <View style={styles.scrollbarTrack}>
          <View style={styles.scrollbarHandle} />
        </View>
        <Text style={styles.arrowIcon}>▶️</Text>
      </View>

      {/* SUBTITLE PROMPT */}
      <Text style={styles.subtitleText}>Master investing in Ghana, one question at a time</Text>

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
              </View>{/* EXPANDABLE BODY CONTENT */}
              {isExpanded && (
                <View style={styles.answerContainer}>
                  <Text style={styles.answerText}>{item.answer}</Text>
                  <TouchableOpacity>
                    <Text style={styles.readMoreLink}>Read full article ↗️</Text>
                  </TouchableOpacity>
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
    flex: 1 
  },
  card: { 
    backgroundColor: '#111A2E', 
    padding: 18, 
    borderRadius: 14, 
    marginBottom: 14, 
    borderWidth: 1, 
    borderColor: '#1E293B'
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