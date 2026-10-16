import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { lightColors } from '@/theme/light';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: lightColors.primary,
        tabBarInactiveTintColor: lightColors.muted,
        headerStyle: { backgroundColor: lightColors.background },
        headerTitleStyle: { fontFamily: 'Inter_700Bold' },
        tabBarStyle: { backgroundColor: lightColors.surface },
      }}>
      <Tabs.Screen
        name="inicio"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={String(color)} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="explorar"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" color={String(color)} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="crear"
        options={{
          title: 'Crear',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" color={String(color)} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={String(color)} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
