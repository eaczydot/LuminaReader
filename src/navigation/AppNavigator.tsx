// App Navigator - Main navigation structure

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '../constants/theme';
import { RootStackParamList, MainTabParamList } from '../types';

// Screens
import LibraryScreen from '../screens/library/LibraryScreen';
import ReaderScreen from '../screens/reader/ReaderScreen';
import FoldersScreen from '../screens/folders/FoldersScreen';
import FolderDetailScreen from '../screens/folders/FolderDetailScreen';
import TagsScreen from '../screens/tags/TagsScreen';
import TagDetailScreen from '../screens/tags/TagDetailScreen';
import IntegrationsScreen from '../screens/integrations/IntegrationsScreen';
import IntegrationSetupScreen from '../screens/integrations/IntegrationSetupScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import SearchScreen from '../screens/library/SearchScreen';
import ImportExportScreen from '../screens/settings/ImportExportScreen';
import ArticleInfoScreen from '../screens/reader/ArticleInfoScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab Bar Icon Component
const TabIcon = ({ name, focused, color }: { name: string; focused: boolean; color: string }) => {
  const icons: Record<string, string> = {
    Library: '📚',
    Folders: '📁',
    Tags: '🏷️',
    Integrations: '🔗',
    Settings: '⚙️',
  };

  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.tabEmoji, { opacity: focused ? 1 : 0.6 }]}>
        {icons[name]}
      </Text>
    </View>
  );
};

// Main Tab Navigator
const MainTabs = () => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => (
          <TabIcon name={route.name} focused={focused} color={color} />
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      })}
    >
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{
          title: 'Library',
        }}
      />
      <Tab.Screen
        name="Folders"
        component={FoldersScreen}
        options={{
          title: 'Folders',
        }}
      />
      <Tab.Screen
        name="Tags"
        component={TagsScreen}
        options={{
          title: 'Tags',
        }}
      />
      <Tab.Screen
        name="Integrations"
        component={IntegrationsScreen}
        options={{
          title: 'Integrations',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

// Root Stack Navigator
export const AppNavigator = () => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Reader"
          component={ReaderScreen}
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="ArticleInfo"
          component={ArticleInfoScreen}
          options={{
            title: 'Article Info',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="FolderDetail"
          component={FolderDetailScreen}
          options={{
            title: 'Folder',
          }}
        />
        <Stack.Screen
          name="TagDetail"
          component={TagDetailScreen}
          options={{
            title: 'Tag',
          }}
        />
        <Stack.Screen
          name="IntegrationSetup"
          component={IntegrationSetupScreen}
          options={{
            title: 'Connect Integration',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="ImportExport"
          component={ImportExportScreen}
          options={{
            title: 'Import & Export',
          }}
        />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{
            title: 'Search',
            animation: 'fade',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabEmoji: {
    fontSize: 24,
  },
});

export default AppNavigator;
