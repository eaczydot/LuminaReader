// Filter Bar Component - Article filter tabs

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';

interface FilterBarProps {
  selectedFilter: 'all' | 'unread' | 'reading' | 'favorites';
  onFilterChange: (filter: 'all' | 'unread' | 'reading' | 'favorites') => void;
  articleCounts: {
    all: number;
    unread: number;
    reading: number;
    favorites: number;
  };
}

const FilterBar: React.FC<FilterBarProps> = ({
  selectedFilter,
  onFilterChange,
  articleCounts,
}) => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const filters: {
    key: 'all' | 'unread' | 'reading' | 'favorites';
    label: string;
    icon: string;
  }[] = [
    { key: 'all', label: 'All', icon: '📚' },
    { key: 'unread', label: 'Unread', icon: '📖' },
    { key: 'reading', label: 'Reading', icon: '⏳' },
    { key: 'favorites', label: 'Favorites', icon: '❤️' },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {filters.map(filter => {
        const isSelected = selectedFilter === filter.key;
        const count = articleCounts[filter.key];

        return (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              { backgroundColor: isSelected ? colors.primary : colors.surface },
            ]}
            onPress={() => onFilterChange(filter.key)}
          >
            <Text style={styles.filterIcon}>{filter.icon}</Text>
            <Text
              style={[
                styles.filterLabel,
                { color: isSelected ? '#FFFFFF' : colors.text },
              ]}
            >
              {filter.label}
            </Text>
            {count > 0 && (
              <View
                style={[
                  styles.countBadge,
                  {
                    backgroundColor: isSelected
                      ? 'rgba(255,255,255,0.2)'
                      : colors.primary + '20',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.countText,
                    { color: isSelected ? '#FFFFFF' : colors.primary },
                  ]}
                >
                  {count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  filterIcon: {
    fontSize: 14,
    marginRight: Spacing.xs,
  },
  filterLabel: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
  },
  countBadge: {
    marginLeft: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  countText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semibold,
  },
});

export default FilterBar;
