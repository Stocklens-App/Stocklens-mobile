import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from 'react-native';

import { API_CONFIG } from '../context/api';

export default function LearnScreen() {
  const [activeCategory, setActiveCategory] = useState('Getting Started');
  const [expandedId, setExpandedId] = useState(null);

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = API_CONFIG.ACADEMIC;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        setModules(Array.isArray(data) ? data : []);
      } catch (error) {
        console.log("LearnScreen error:", error.message);
        setModules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = Array.isArray(modules)
    ? modules.filter(item => item.category === activeCategory)
    : [];

  const categories = ['Getting Started', 'Glossary', 'GSE Basics', 'Scams'];

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={[styles.subtitleText, { marginTop: 15 }]}>
          Connecting to StockLens network...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Learn</Text>

      {/* CATEGORIES */}
      <View style={{ height: 40, marginBottom: 5 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContainer}
        >
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

      {/* SUBTITLE */}
      <Text style={styles.subtitleText}>
        Master investing in Ghana, one question at a time
      </Text>

      {/* LIST */}
      <ScrollView style={styles.questionsList} showsVerticalScrollIndicator={false}>
        {filteredData.map((item) => {
          const id = item.id || item._id;
          const isExpanded = expandedId === id;

          return (
            <TouchableOpacity
              key={id}
              activeOpacity={0.9}
              onPress={() => toggleExpand(id)}
              style={[styles.card, isExpanded && styles.expandedCard]}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.boxIcon, isExpanded && styles.boxIconActive]}>
                  <View style={[styles.boxInner, isExpanded && styles.boxInnerActive]} />
                </View>

                <Text style={styles.questionText}>{item.question}</Text>

                <Text style={styles.chevronIcon}>
                  {isExpanded ? '▲' : '▼'}
                </Text>
              </View>

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

/* STYLES UNCHANGED */
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