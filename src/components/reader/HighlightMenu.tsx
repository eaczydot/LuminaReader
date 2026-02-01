// Highlight Menu Component - Contextual menu for highlights

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { Highlight, HighlightColor, HIGHLIGHT_COLORS } from '../../types';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HighlightMenuProps {
  visible: boolean;
  position: { x: number; y: number };
  selectedHighlight: Highlight | null;
  onClose: () => void;
  onCreateHighlight: (color: HighlightColor) => void;
  onDeleteHighlight: () => void;
  onCopyHighlight: () => void;
  onUpdateColor: (color: HighlightColor) => void;
}

const HighlightMenu: React.FC<HighlightMenuProps> = ({
  visible,
  position,
  selectedHighlight,
  onClose,
  onCreateHighlight,
  onDeleteHighlight,
  onCopyHighlight,
  onUpdateColor,
}) => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const highlightColors: HighlightColor[] = ['yellow', 'green', 'blue', 'pink', 'purple', 'orange'];

  // Calculate menu position
  const menuWidth = 200;
  const menuHeight = selectedHighlight ? 180 : 120;
  let left = Math.max(Spacing.md, Math.min(position.x - menuWidth / 2, SCREEN_WIDTH - menuWidth - Spacing.md));
  let top = Math.max(100, position.y - menuHeight - 20);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[
            styles.menu,
            {
              backgroundColor: colors.surface,
              left,
              top,
            },
            Shadows.lg,
          ]}
        >
          {/* Color Selection */}
          <View style={styles.colorRow}>
            {highlightColors.map(color => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  { backgroundColor: HIGHLIGHT_COLORS[color] },
                  selectedHighlight?.color === color && styles.colorSelected,
                ]}
                onPress={() => {
                  if (selectedHighlight) {
                    onUpdateColor(color);
                  } else {
                    onCreateHighlight(color);
                  }
                }}
              />
            ))}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onCopyHighlight}
            >
              <Text style={styles.actionIcon}>📋</Text>
              <Text style={[styles.actionText, { color: colors.text }]}>Copy</Text>
            </TouchableOpacity>

            {selectedHighlight ? (
              <>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    // Add note functionality
                    onClose();
                  }}
                >
                  <Text style={styles.actionIcon}>📝</Text>
                  <Text style={[styles.actionText, { color: colors.text }]}>Note</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={onDeleteHighlight}
                >
                  <Text style={styles.actionIcon}>🗑️</Text>
                  <Text style={[styles.actionText, { color: colors.error }]}>Delete</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  // Share selected text
                  onClose();
                }}
              >
                <Text style={styles.actionIcon}>↗️</Text>
                <Text style={[styles.actionText, { color: colors.text }]}>Share</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  menu: {
    position: 'absolute',
    width: 200,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  colorButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSelected: {
    borderColor: '#000000',
  },
  divider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: Spacing.sm,
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: Spacing.xs,
  },
  actionText: {
    fontSize: Typography.fontSizes.xs,
  },
});

export default HighlightMenu;
