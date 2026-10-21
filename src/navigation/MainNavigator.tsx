import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Book } from '../types';
import { LibraryScreen } from '../screens/LibraryScreen';
import { FocusScreen } from '../screens/FocusScreen';
import { NotesScreen } from '../screens/NotesScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { COLORS } from '../theme/colors';

type TabType = 'library' | 'focus' | 'notes' | 'settings';

interface TabItem {
  id: TabType;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}

const TABS: TabItem[] = [
  { id: 'library', label: 'Library', icon: 'book' },
  { id: 'focus', label: 'Focus', icon: 'target' },
  { id: 'notes', label: 'Notes', icon: 'file-text' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

export const MainNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('library');

  const handleNavigateToFocus = (_book?: Book) => {
    setActiveTab('focus');
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'library':
        return <LibraryScreen onNavigateToFocus={handleNavigateToFocus} />;
      case 'focus':
        return <FocusScreen />;
      case 'notes':
        return <NotesScreen />;
      case 'settings':
        return <SettingsScreen />;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Active Screen View */}
      <View style={styles.contentView}>{renderActiveScreen()}</View>

      {/* OLED Bottom Tab Bar */}
      <View
        style={[
          styles.tabBar,
          {
            paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 16 : 10),
          },
        ]}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabBtn}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`${tab.label} tab`}
            >
              <Feather
                name={tab.icon}
                size={22}
                color={isActive ? COLORS.accent : COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.tabLabel,
                  isActive && styles.tabLabelActive,
                ]}
              >
                {tab.label}
              </Text>
              {isActive && <View style={styles.activeDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentView: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#222222',
    paddingTop: 10,
    ...Platform.select({
      web: {
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.6)',
      },
    }),
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 2,
  },
  tabLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
  },
  tabLabelActive: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  activeDot: {
    position: 'absolute',
    top: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
  },
});
