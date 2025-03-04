// ========================
// ACHIEVEMENT SYSTEM
// ========================

import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  Animated, 
  Image 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { useProgress } from '../../contexts/ProgressContext';
import { Achievement } from '../../types/achievement';

// Achievement display item component
const AchievementItem = ({ achievement, earned, onPress }) => {
  const { theme } = useTheme();
  
  return (
    <TouchableOpacity 
      style={[
        styles.achievementItem, 
        { 
          backgroundColor: theme.colors.surface,
          borderColor: earned ? theme.colors.primary : theme.colors.border 
        }
      ]}
      onPress={() => onPress(achievement)}
      activeOpacity={0.8}
    >
      <View style={[
        styles.iconContainer,
        {
          backgroundColor: earned ? theme.colors.primary : 'rgba(255,255,255,0.1)',
          opacity: earned ? 1 : 0.5
        }
      ]}>
        {earned ? (
          <Text style={styles.achievementIcon}>{achievement.icon}</Text>
        ) : (
          <Text style={styles.lockedIcon}>?</Text>
        )}
      </View>
      
      <View style={styles.achievementDetails}>
        <Text 
          style={[
            styles.achievementTitle, 
            { color: earned ? theme.colors.text : theme.colors.textSecondary }
          ]}
          numberOfLines={1}
        >
          {achievement.title}
        </Text>
        
        <Text 
          style={[
            styles.achievementDescription, 
            { color: theme.colors.textSecondary }
          ]}
          numberOfLines={2}
        >
          {earned ? achievement.description : 'Achievement locked'}
        </Text>
      </View>
      
      {earned && (
        <View style={[
          styles.earnedBadge, 
          { backgroundColor: theme.colors.success }
        ]}>
          <Text style={styles.earnedText}>Earned</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// Achievement detail modal component
const AchievementDetailModal = ({ visible, achievement, onClose }) => {
  const { theme } = useTheme();
  const [animation] = useState(new Animated.Value(0));
  
  useEffect(() => {
    if (visible) {
      Animated.spring(animation, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      animation.setValue(0);
    }
  }, [visible]);
  
  if (!achievement) return null;
  
  const modalScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1]
  });
  
  const modalOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View 
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
              transform: [{ scale: modalScale }],
              opacity: modalOpacity
            }
          ]}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.modalHeader}
          >
            <Text style={styles.modalTitle}>{achievement.title}</Text>
          </LinearGradient>
          
          <View style={styles.modalBody}>
            <View style={[
              styles.modalIconContainer,
              { backgroundColor: theme.colors.primary }
            ]}>
              <Text style={styles.modalIcon}>{achievement.icon}</Text>
            </View>
            
            <Text 
              style={[
                styles.modalDescription, 
                { color: theme.colors.text }
              ]}
            >
              {achievement.description}
            </Text>
            
            <Text 
              style={[
                styles.modalCriteria, 
                { color: theme.colors.textSecondary }
              ]}
            >
              {achievement.criteria}
            </Text>
            
            {achievement.reward && (
              <View style={[
                styles.rewardContainer,
                { backgroundColor: theme.colors.surface }
              ]}>
                <Text 
                  style={[
                    styles.rewardLabel, 
                    { color: theme.colors.textSecondary }
                  ]}
                >
                  Reward:
                </Text>
                <Text 
                  style={[
                    styles.rewardValue, 
                    { color: theme.colors.text }
                  ]}
                >
                  {achievement.reward}
                </Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity
            style={[
              styles.closeButton,
              { backgroundColor: theme.colors.primary }
            ]}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Achievement notification component
const AchievementNotification = ({ achievement, onComplete }) => {
  const { theme } = useTheme();
  const [animation] = useState(new Animated.Value(0));
  
  useEffect(() => {
    // Entry animation
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(3000),
      Animated.timing(animation, {
        toValue: 2,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start(() => {
      if (onComplete) onComplete();
    });
  }, []);
  
  const translateY = animation.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [-100, 0, -100]
  });
  
  const opacity = animation.interpolate({
    inputRange: [0, 0.1, 0.9, 1, 2],
    outputRange: [0, 1, 1, 0, 0]
  });
  
  return (
    <Animated.View
      style={[
        styles.notification,
        {
          backgroundColor: theme.colors.primary,
          transform: [{ translateY }],
          opacity
        }
      ]}
    >
      <View style={styles.notificationIconContainer}>
        <Text style={styles.notificationIcon}>{achievement.icon}</Text>
      </View>
      
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>Achievement Unlocked!</Text>
        <Text style={styles.notificationText}>{achievement.title}</Text>
      </View>
    </Animated.View>
  );
};

// Main Achievement System component
const AchievementSystem = () => {
  const { theme } = useTheme();
  const { progress } = useProgress();
  const [achievements, setAchievements] = useState([]);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newAchievement, setNewAchievement] = useState(null);
  
  // Load achievements (would normally come from API or content system)
  useEffect(() => {
    // Sample achievements data
    const achievementsData = [
      {
        id: 'mechanics-1',
        title: 'Grammar Guru',
        description: 'Complete 10 grammar exercises with 90% or higher accuracy',
        criteria: 'Complete 10 grammar exercises with 90% or higher accuracy',
        icon: '📝',
        category: 'mechanics',
        reward: '50 XP',
      },
      {
        id: 'sequencing-1',
        title: 'Paragraph Pro',
        description: 'Organize 5 paragraphs in the correct logical order',
        criteria: 'Successfully complete 5 paragraph ordering exercises',
        icon: '📋',
        category: 'sequencing',
        reward: '75 XP',
      },
      {
        id: 'voice-1',
        title: 'Word Wizard',
        description: 'Use advanced vocabulary in 3 different writing assignments',
        criteria: 'Use at least 5 advanced vocabulary words in 3 different OWL quests',
        icon: '🔮',
        category: 'voice',
        reward: '100 XP',
      },
      {
        id: 'owl-1',
        title: 'Rookie Reporter',
        description: 'Complete your first journalism assignment for The Gazette',
        criteria: 'Submit a completed news article to Editor Byline',
        icon: '📰',
        category: 'owl',
        reward: 'Press Badge',
      },
      {
        id: 'streak-1',
        title: 'On a Roll',
        description: 'Complete exercises for 5 days in a row',
        criteria: 'Log in and complete at least one exercise for 5 consecutive days',
        icon: '🔥',
        category: 'engagement',
        reward: '150 XP',
      },
    ];
    
    setAchievements(achievementsData);
    
    // Simulate a new achievement unlock (for demonstration)
    setTimeout(() => {
      setNewAchievement(achievementsData[0]);
    }, 2000);
  }, []);
  
  const handleAchievementPress = (achievement) => {
    setSelectedAchievement(achievement);
    setModalVisible(true);
  };
  
  const handleCloseModal = () => {
    setModalVisible(false);
  };
  
  const handleNotificationComplete = () => {
    setNewAchievement(null);
  };
  
  const isAchievementEarned = (achievementId) => {
    return progress.achievements.includes(achievementId);
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Achievement Categories */}
      <View style={styles.categories}>
        <TouchableOpacity style={[styles.categoryTab, styles.activeCategory]}>
          <Text style={styles.categoryText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryTab}>
          <Text style={[styles.categoryText, { color: theme.colors.textSecondary }]}>Mechanics</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryTab}>
          <Text style={[styles.categoryText, { color: theme.colors.textSecondary }]}>Sequencing</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryTab}>
          <Text style={[styles.categoryText, { color: theme.colors.textSecondary }]}>Voice</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryTab}>
          <Text style={[styles.categoryText, { color: theme.colors.textSecondary }]}>OWL</Text>
        </TouchableOpacity>
      </View>
      
      {/* Achievements List */}
      <FlatList
        data={achievements}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AchievementItem
            achievement={item}
            earned={isAchievementEarned(item.id)}
            onPress={handleAchievementPress}
          />
        )}
        contentContainerStyle={styles.achievementsList}
      />
      
      {/* Achievement Detail Modal */}
      <AchievementDetailModal
        visible={modalVisible}
        achievement={selectedAchievement}
        onClose={handleCloseModal}
      />
      
      {/* New Achievement Notification */}
      {newAchievement && (
        <AchievementNotification
          achievement={newAchievement}
          onComplete={handleNotificationComplete}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categories: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  categoryTab: {
    marginRight: 16,
    paddingBottom: 8,
  },
  activeCategory: {
    borderBottomWidth: 2,
    borderBottomColor: '#6320ee',
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  achievementsList: {
    padding: 16,
  },
  achievementItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementIcon: {
    fontSize: 24,
  },
  lockedIcon: {
    fontSize: 24,
    color: 'rgba(255,255,255,0.5)',
  },
  achievementDetails: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 12,
  },
  earnedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  earnedText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    width: '80%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 16,
    alignItems: 'center',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 16,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIcon: {
    fontSize: 40,
  },
  modalDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  modalCriteria: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  rewardContainer: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  rewardValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 14,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  notification: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  notificationIconContainer: {
    marginRight: 12,
  },
  notificationIcon: {
    fontSize: 24,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notificationText: {
    color: '#ffffff',
    fontSize: 14,
  },
});

export default AchievementSystem;


// ========================
// TEACHER DASHBOARD COMPONENT
// ========================

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

// Sample data for teacher dashboard
const SAMPLE_CLASS_DATA = {
  className: 'English 101',
  grade: 7,
  students: [
    {
      id: '1',
      name: 'Ethan Martinez',
      progress: {
        redi: {
          mechanics: 65,
          sequencing: 42,
          voice: 21,
        },
        owl: {
          completedQuests: 3,
          lastActive: '2023-09-15T14:20:00.000Z',
        },
      },
    },
    {
      id: '2',
      name: 'Sophia Chen',
      progress: {
        redi: {
          mechanics: 82,
          sequencing: 68,
          voice: 45,
        },
        owl: {
          completedQuests: 7,
          lastActive: '2023-09-16T10:45:00.000Z',
        },
      },
    },
    {
      id: '3',
      name: 'Jamal Washington',
      progress: {
        redi: {
          mechanics: 95,
          sequencing: 88,
          voice: 72,
        },
        owl: {
          completedQuests: 12,
          lastActive: '2023-09-16T16:30:00.000Z',
        },
      },
    },
    {
      id: '4',
      name: 'Emma Reynolds',
      progress: {
        redi: {
          mechanics: 78,
          sequencing: 52,
          voice: 38,
        },
        owl: {
          completedQuests: 5,
          lastActive: '2023-09-15T11:10:00.000Z',
        },
      },
    },
    {
      id: '5',
      name: 'Aiden Patel',
      progress: {
        redi: {
          mechanics: 45,
          sequencing: 32,
          voice: 15,
        },
        owl: {
          completedQuests: 1,
          lastActive: '2023-09-14T09:20:00.000Z',
        },
      },
    },
  ],
  overallProgress: {
    mechanics: 73,
    sequencing: 56,
    voice: 38,
  },
  recentActivity: [
    {
      type: 'Quest Completion',
      student: 'Sophia Chen',
      detail: 'Completed "Festival News Report"',
      timestamp: '2023-09-16T10:45:00.000Z',
    },
    {
      type: 'Exercise Completion',
      student: 'Jamal Washington',
      detail: 'Completed Voice Level 3 with 92% accuracy',
      timestamp: '2023-09-16T09:30:00.000Z',
    },
    {
      type: 'New Achievement',
      student: 'Emma Reynolds',
      detail: 'Earned "Paragraph Pro" achievement',
      timestamp: '2023-09-15T14:15:00.000Z',
    },
  ],
};

// Progress bar component
const ProgressBar = ({ value, color, height = 8 }) => {
  return (
    <View style={[styles.progressBarContainer, { height }]}>
      <View 
        style={[
          styles.progressBarFill, 
          { width: `${value}%`, backgroundColor: color, height }
        ]} 
      />
    </View>
  );
};

// Student list item component
const StudentListItem = ({ student, onSelect }) => {
  const { theme } = useTheme();
  
  // Calculate average skill progress
  const averageProgress = Math.round(
    (student.progress.redi.mechanics + 
     student.progress.redi.sequencing + 
     student.progress.redi.voice) / 3
  );
  
  // Format date string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  // Determine progress color based on value
  const getProgressColor = (value) => {
    if (value >= 80) return theme.colors.success;
    if (value >= 50) return theme.colors.primary;
    return theme.colors.error;
  };
  
  return (
    <TouchableOpacity 
      style={[
        styles.studentItem, 
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }
      ]}
      onPress={() => onSelect(student)}
    >
      <View style={styles.studentHeader}>
        <Text style={[styles.studentName, { color: theme.colors.text }]}>
          {student.name}
        </Text>
        <Text style={[styles.lastActive, { color: theme.colors.textSecondary }]}>
          Last active: {formatDate(student.progress.owl.lastActive)}
        </Text>
      </View>
      
      <View style={styles.progressSection}>
        <View style={styles.skillProgress}>
          <View style={styles.skillLabel}>
            <Text style={[styles.skillText, { color: theme.colors.textSecondary }]}>
              Mechanics
            </Text>
            <Text style={{ color: theme.colors.text }}>
              {student.progress.redi.mechanics}%
            </Text>
          </View>
          <ProgressBar 
            value={student.progress.redi.mechanics} 
            color={getProgressColor(student.progress.redi.mechanics)} 
          />
        </View>
        
        <View style={styles.skillProgress}>
          <View style={styles.skillLabel}>
            <Text style={[styles.skillText, { color: theme.colors.textSecondary }]}>
              Sequencing
            </Text>
            <Text style={{ color: theme.colors.text }}>
              {student.progress.redi.sequencing}%
            </Text>
          </View>
          <ProgressBar 
            value={student.progress.redi.sequencing} 
            color={getProgressColor(student.progress.redi.sequencing)} 
          />
        </View>
        
        <View style={styles.skillProgress}>
          <View style={styles.skillLabel}>
            <Text style={[styles.skillText, { color: theme.colors.textSecondary }]}>
              Voice
            </Text>
            <Text style={{ color: theme.colors.text }}>
              {student.progress.redi.voice}%
            </Text>
          </View>
          <ProgressBar 
            value={student.progress.redi.voice} 
            color={getProgressColor(student.progress.redi.voice)} 
          />
        </View>
      </View>
      
      <View style={styles.studentFooter}>
        <View style={styles.questCount}>
          <Text style={[styles.countLabel, { color: theme.colors.textSecondary }]}>
            Quests Completed
          </Text>
          <Text style={[styles.countValue, { color: theme.colors.primary }]}>
            {student.progress.owl.completedQuests}
          </Text>
        </View>
        
        <View style={styles.overallProgress}>
          <Text style={[styles.overallLabel, { color: theme.colors.textSecondary }]}>
            Overall Progress
          </Text>
          <Text 
            style={[
              styles.overallValue, 
              { color: getProgressColor(averageProgress) }
            ]}
          >
            {averageProgress}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Activity item component
const ActivityItem = ({ activity }) => {
  const { theme } = useTheme();
  
  // Format date string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get icon based on activity type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'Quest Completion':
        return 'checkmark-circle';
      case 'Exercise Completion':
        return 'school';
      case 'New Achievement':
        return 'trophy';
      default:
        return 'ellipse';
    }
  };
  
  return (
    <View 
      style={[
        styles.activityItem, 
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }
      ]}
    >
      <View style={styles.activityIconContainer}>
        <Ionicons 
          name={getActivityIcon(activity.type)} 
          size={20} 
          color={theme.colors.primary} 
        />
      </View>
      
      <View style={styles.activityContent}>
        <Text style={[styles.activityStudent, { color: theme.colors.text }]}>
          {activity.student}
        </Text>
        <Text style={[styles.activityDetail, { color: theme.colors.textSecondary }]}>
          {activity.detail}
        </Text>
      </View>
      
      <Text style={[styles.activityTime, { color: theme.colors.textSecondary }]}>
        {formatDate(activity.timestamp)}
      </Text>
    </View>
  );
};

// Main teacher dashboard component
const TeacherDashboard = () => {
  const { theme } = useTheme();
  const [classData, setClassData] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Load class data
  useEffect(() => {
    // In a real app, this would fetch from API
    setClassData(SAMPLE_CLASS_DATA);
  }, []);
  
  if (!classData) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text }}>Loading class data...</Text>
      </View>
    );
  }
  
  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setActiveTab('students');
  };
  
  // Render the class overview tab
  const renderOverviewTab = () => {
    return (
      <ScrollView style={styles.tabContent}>
        {/* Class Summary */}
        <View 
          style={[
            styles.summaryCard, 
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Class Summary
          </Text>
          
          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {classData.students.length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Students
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {Math.round(
                  classData.students.reduce(
                    (sum, student) => sum + student.progress.owl.completedQuests, 
                    0
                  ) / classData.students.length
                )}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Avg. Quests
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {Math.round(
                  (classData.overallProgress.mechanics + 
                   classData.overallProgress.sequencing + 
                   classData.overallProgress.voice) / 3
                )}%
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Avg. Progress
              </Text>
            </View>
          </View>
        </View>
        
        {/* Class Progress */}
        <View 
          style={[
            styles.progressCard, 
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Class Progress
          </Text>
          
          <View style={styles.classProgress}>
            <View style={styles.progressItem}>
              <View style={styles.progressHeader}>
                <Text style={[styles.progressLabel, { color: theme.colors.text }]}>
                  Mechanics
                </Text>
                <Text style={[styles.progressValue, { color: theme.colors.primary }]}>
                  {classData.overallProgress.mechanics}%
                </Text>
              </View>
              <ProgressBar 
                value={classData.overallProgress.mechanics} 
                color={theme.colors.primary}
                height={12} 
              />
            </View>
            
            <View style={styles.progressItem}>
              <View style={styles.progressHeader}>
                <Text style={[styles.progressLabel, { color: theme.colors.text }]}>
                  Sequencing
                </Text>
                <Text style={[styles.progressValue, { color: theme.colors.primary }]}>
                  {classData.overallProgress.sequencing}%
                </Text>
              </View>
              <ProgressBar 
                value={classData.overallProgress.sequencing} 
                color={theme.colors.primary}
                height={12} 
              />
            </View>
            
            <View style={styles.progressItem}>
              <View style={styles.progressHeader}>
                <Text style={[styles.progressLabel, { color: theme.colors.text }]}>
                  Voice
                </Text>
                <Text style={[styles.progressValue, { color: theme.colors.primary }]}>
                  {classData.overallProgress.voice}%
                </Text>
              </View>
              <ProgressBar 
                value={classData.overallProgress.voice} 
                color={theme.colors.primary}
                height={12} 
              />
            </View>
          </View>
        </View>
        
        {/* Recent Activity */}
        <View 
          style={[
            styles.activityCard, 
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Recent Activity
          </Text>
          
          <View style={styles.activityList}>
            {classData.recentActivity.map((activity, index) => (
              <ActivityItem key={index} activity={activity} />
            ))}
          </View>
          
          <TouchableOpacity 
            style={[
              styles.viewAllButton, 
              { borderTopColor: theme.colors.border }
            ]}
          >
            <Text style={{ color: theme.colors.primary }}>
              View All Activity
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };
  
  // Render the students tab
  const renderStudentsTab = () => {
    return (
      <View style={styles.tabContent}>
        {selectedStudent ? (
          <View style={styles.studentDetail}>
            {/* Student Detail Header */}
            <View 
              style={[
                styles.detailHeader, 
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }
              ]}
            >
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => setSelectedStudent(null)}
              >
                <Ionicons 
                  name="arrow-back" 
                  size={20} 
                  color={theme.colors.primary} 
                />
                <Text style={{ color: theme.colors.primary, marginLeft: 4 }}>
                  Back to List
                </Text>
              </TouchableOpacity>
              
              <Text style={[styles.detailName, { color: theme.colors.text }]}>
                {selectedStudent.name}
              </Text>
              
              <TouchableOpacity style={styles.messageButton}>
                <Ionicons 
                  name="mail" 
                  size={20} 
                  color={theme.colors.primary} 
                />
                <Text style={{ color: theme.colors.primary, marginLeft: 4 }}>
                  Message
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Student Detail Content would go here */}
            <Text style={[styles.placeholderText, { color: theme.colors.text }]}>
              Detailed student analytics would be displayed here...
            </Text>
          </View>
        ) : (
          <FlatList
            data={classData.students}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <StudentListItem
                student={item}
                onSelect={handleStudentSelect}
              />
            )}
            contentContainerStyle={styles.studentList}
          />
        )}
      </View>
    );
  };
  
  // Render the assignments tab (placeholder)
  const renderAssignmentsTab = () => {
    return (
      <View style={[styles.tabContent, styles.placeholderTab]}>
        <Text style={[styles.placeholderText, { color: theme.colors.text }]}>
          Assignments tab content would go here...
        </Text>
      </View>
    );
  };
  
  // Render the reports tab (placeholder)
  const renderReportsTab = () => {
    return (
      <View style={[styles.tabContent, styles.placeholderTab]}>
        <Text style={[styles.placeholderText, { color: theme.colors.text }]}>
          Reports tab content would go here...
        </Text>
      </View>
    );
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.className, { color: theme.colors.text }]}>
          {classData.className}
        </Text>
        <Text style={[styles.grade, { color: theme.colors.textSecondary }]}>
          Grade {classData.grade}
        </Text>
      </View>
      
      {/* Tab Navigation */}
      <View style={[styles.tabBar, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'overview' && styles.activeTab
          ]}
          onPress={() => setActiveTab('overview')}
        >
          <Text 
            style={[
              styles.tabText, 
              { color: activeTab === 'overview' ? theme.colors.primary : theme.colors.textSecondary }
            ]}
          >
            Overview
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'students' && styles.activeTab
          ]}
          onPress={() => setActiveTab('students')}
        >
          <Text 
            style={[
              styles.tabText, 
              { color: activeTab === 'students' ? theme.colors.primary : theme.colors.textSecondary }
            ]}
          >
            Students
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'assignments' && styles.activeTab
          ]}
          onPress={() => setActiveTab('assignments')}
        >
          <Text 
            style={[
              styles.tabText, 
              { color: activeTab === 'assignments' ? theme.colors.primary : theme.colors.textSecondary }
            ]}
          >
            Assignments
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'reports' && styles.activeTab
          ]}
          onPress={() => setActiveTab('reports')}
        >
          <Text 
            style={[
              styles.tabText, 
              { color: activeTab === 'reports' ? theme.colors.primary : theme.colors.textSecondary }
            ]}
          >
            Reports
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Tab Content */}
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'students' && renderStudentsTab()}
      {activeTab === 'assignments' && renderAssignmentsTab()}
      {activeTab === 'reports' && renderReportsTab()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  className: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  grade: {
    fontSize: 16,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#6320ee',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabContent: {
    flex: 1,
  },
  summaryCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  progressCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  activityCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  classProgress: {
    marginBottom: 8,
  },
  progressItem: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    borderRadius: 4,
  },
  activityList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  activityIconContainer: {
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityStudent: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  activityDetail: {
    fontSize: 12,
  },
  activityTime: {
    fontSize: 12,
  },
  viewAllButton: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
  },
  studentList: {
    padding: 16,
  },
  studentItem: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  studentHeader: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  lastActive: {
    fontSize: 12,
  },
  progressSection: {
    padding: 12,
  },
  skillProgress: {
    marginBottom: 8,
  },
  skillLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  skillText: {
    fontSize: 12,
  },
  studentFooter: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  questCount: {
    flex: 1,
  },
  countLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  countValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  overallProgress: {
    flex: 1,
    alignItems: 'flex-end',
  },
  overallLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  overallValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  studentDetail: {
    flex: 1,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailName: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeholderTab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
});

export default TeacherDashboard;


// ========================
// ANIMATION UTILITIES
// ========================

// src/utils/animationUtils.js

import { Animated, Easing } from 'react-native';

/**
 * Creates a pulsing animation for drawing attention to UI elements
 * @param {Animated.Value} animatedValue - The animated value to drive the pulse
 * @param {Object} options - Animation options
 * @returns {Object} Animation controls
 */
export const createPulseAnimation = (animatedValue, options = {}) => {
  const {
    minValue = 0.8,
    maxValue = 1.1,
    duration = 1000,
    easing = Easing.inOut(Easing.ease),
  } = options;
  
  const startAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: maxValue,
          duration: duration / 2,
          easing,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: minValue,
          duration: duration / 2,
          easing,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };
  
  const stopAnimation = () => {
    animatedValue.stopAnimation();
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };
  
  return {
    start: startAnimation,
    stop: stopAnimation,
    value: animatedValue,
  };
};

/**
 * Creates a sequence animation for revealing content progressively
 * @param {Array<Animated.Value>} animatedValues - Array of animated values
 * @param {Object} options - Animation options
 * @returns {Function} Start animation function
 */
export const createSequenceAnimation = (animatedValues, options = {}) => {
  const {
    stagger = 150,
    duration = 500,
    startDelay = 0,
    easing = Easing.out(Easing.cubic),
    finalValue = 1,
  } = options;
  
  return () => {
    Animated.stagger(
      stagger,
      animatedValues.map(anim => 
        Animated.timing(anim, {
          toValue: finalValue,
          duration,
          easing,
          useNativeDriver: true,
        })
      ),
      { startDelay }
    ).start();
  };
};

/**
 * Creates a typing text animation effect
 * @param {Animated.Value} animatedValue - Animated value for interpolation
 * @param {string} text - The text to animate typing
 * @param {Object} options - Animation options
 * @returns {Object} Animation controls and interpolated text
 */
export const createTypingAnimation = (animatedValue, text, options = {}) => {
  const {
    typingSpeed = 50, // ms per character
    startDelay = 500,
  } = options;
  
  // Calculate total animation duration based on text length
  const totalDuration = text.length * typingSpeed;
  
  const startAnimation = () => {
    animatedValue.setValue(0);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: totalDuration,
      delay: startDelay,
      useNativeDriver: false, // Must be false for string interpolation
    }).start();
  };
  
  // Create interpolation that reveals text progressively
  const interpolatedText = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['', text],
    extrapolate: 'clamp',
  });
  
  return {
    start: startAnimation,
    reset: () => animatedValue.setValue(0),
    text: interpolatedText,
  };
};

/**
 * Creates a path drawing animation for SVG elements
 * @param {Animated.Value} animatedValue - The animated value
 * @param {Object} options - Animation options
 * @returns {Object} Animation controls and stroke props
 */
export const createPathAnimation = (animatedValue, options = {}) => {
  const {
    duration = 1500,
    easing = Easing.inOut(Easing.cubic),
    delay = 0,
  } = options;
  
  const startAnimation = () => {
    animatedValue.setValue(0);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      easing,
      delay,
      useNativeDriver: true,
    }).start();
  };
  
  // Stroke dash props for SVG animation
  const strokeDasharray = 1000; // Adjust based on your SVG path length
  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [strokeDasharray, 0],
    extrapolate: 'clamp',
  });
  
  return {
    start: startAnimation,
    reset: () => animatedValue.setValue(0),
    strokeProps: {
      strokeDasharray,
      strokeDashoffset,
    },
  };
};

/**
 * Creates a bounce entrance animation for UI elements
 * @param {Animated.Value} animatedValue - The animated value
 * @param {Object} options - Animation options
 * @returns {Object} Animation controls and style
 */
export const createBounceAnimation = (animatedValue, options = {}) => {
  const {
    startScale = 0.3,
    overshootScale = 1.1,
    finalScale = 1,
    duration = 800,
    delay = 0,
  } = options;
  
  const startAnimation = () => {
    animatedValue.setValue(startScale);
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: overshootScale,
        duration: duration * 0.7,
        easing: Easing.out(Easing.cubic),
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: finalScale,
        duration: duration * 0.3,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  // Animation style for transforming components
  const animationStyle = {
    transform: [{ scale: animatedValue }],
  };
  
  return {
    start: startAnimation,
    reset: () => animatedValue.setValue(startScale),
    style: animationStyle,
  };
};

/**
 * Creates a shimmer loading effect animation
 * @param {Animated.Value} animatedValue - The animated value
 * @param {Object} options - Animation options
 * @returns {Object} Animation controls and gradient props
 */
export const createShimmerAnimation = (animatedValue, options = {}) => {
  const {
    width = 300,
    duration = 1500,
  } = options;
  
  const startAnimation = () => {
    animatedValue.setValue(-width);
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: width,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };
  
  // Animation style for shimmer effect
  const shimmerTranslateX = animatedValue;
  
  return {
    start: startAnimation,
    stop: () => animatedValue.stopAnimation(),
    shimmerTranslateX,
  };
};

// Export a utility for creating animated values quickly
export const createAnimatedValues = (count = 1, initialValue = 0) => {
  return Array(count).fill().map(() => new Animated.Value(initialValue));
};

// Example usage of animation utilities:
/*
// In a component:
import { createPulseAnimation, createAnimatedValues } from '../utils/animationUtils';

const MyComponent = () => {
  const [pulseAnim] = useState(new Animated.Value(1));
  const pulseAnimation = createPulseAnimation(pulseAnim);
  
  useEffect(() => {
    pulseAnimation.start();
    return () => pulseAnimation.stop();
  }, []);
  
  return (
    <Animated.View style={[styles.node, { transform: [{ scale: pulseAnim }] }]}>
      <Text>Pulsing Node</Text>
    </Animated.View>
  );
};
*/