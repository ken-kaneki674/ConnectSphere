import React, { useState, useCallback } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';

// Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { FeedScreen } from '../screens/feed/FeedScreen';
import { PostDetailScreen } from '../screens/feed/PostDetailScreen';
import { CreatePostScreen } from '../screens/feed/CreatePostScreen';
import { SearchScreen } from '../screens/search/SearchScreen';
import { GroupsScreen } from '../screens/groups/GroupsScreen';
import { GroupDetailScreen } from '../screens/groups/GroupDetailScreen';
import { CreateGroupScreen } from '../screens/groups/CreateGroupScreen';
import { MessagesScreen } from '../screens/messages/MessagesScreen';
import { ChatDetailScreen } from '../screens/messages/ChatDetailScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { UserProfileScreen } from '../screens/profile/UserProfileScreen';
import { FriendsScreen } from '../screens/profile/FriendsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [unreadMessages, setUnreadMessages] = useState(0);

  useFocusEffect(
    useCallback(() => {
      api.getConversations().then((convs) => {
        if (Array.isArray(convs)) {
          const total = convs.reduce((sum, c) => sum + (c.unread_count || 0), 0);
          setUnreadMessages(total);
        }
      });
    }, [])
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 56 + Math.max(8, insets.bottom),
          paddingBottom: Math.max(8, insets.bottom),
          paddingTop: 6,
        },
        tabBarActiveTintColor: theme.colors.primaryLight,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName;

          if (route.name === 'Feed') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Groups') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} options={{ tabBarLabel: 'Accueil' }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ tabBarLabel: 'Explorer' }} />
      <Tab.Screen name="Groups" component={GroupsScreen} options={{ tabBarLabel: 'Groupes' }} />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarLabel: 'Messages',
          tabBarBadge: unreadMessages > 0 ? unreadMessages : undefined,
          tabBarBadgeStyle: { backgroundColor: theme.colors.accent, fontSize: 10 },
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profil' }} />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen name="PostDetail" component={PostDetailScreen} />
            <Stack.Screen
              name="CreatePost"
              component={CreatePostScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
            <Stack.Screen
              name="CreateGroup"
              component={CreateGroupScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
            <Stack.Screen name="Friends" component={FriendsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
