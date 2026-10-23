import { Href, Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet } from 'react-native';
import { LoadingView } from '@/components/ui/LoadingView';
import { useAuthGate } from '@/hooks/useAuthGate';
import { lightColors } from '@/theme/light';

type TabIconProps = {
  focused: boolean;
  color: string;
  size: number;
  active: keyof typeof Ionicons.glyphMap;
  inactive: keyof typeof Ionicons.glyphMap;
};

function TabIcon({ focused, color, size, active, inactive }: TabIconProps) {
  return (
    <Ionicons name={focused ? active : inactive} color={String(color)} size={size} />
  );
}

export default function TabLayout() {
  const status = useAuthGate();

  if (status === 'loading') {
    return <LoadingView />;
  }
  if (status === 'login') {
    return <Redirect href="/(auth)/ingreso" />;
  }
  if (status === 'alias') {
    return <Redirect href={'/(auth)/elegir-alias' as Href} />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: lightColors.primary,
        tabBarInactiveTintColor: lightColors.muted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
      }}>
      <Tabs.Screen
        name="inicio"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              focused={focused}
              color={String(color)}
              size={size}
              active="home"
              inactive="home-outline"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explorar"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              focused={focused}
              color={String(color)}
              size={size}
              active="search"
              inactive="search-outline"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="crear"
        options={{
          title: 'Crear',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              focused={focused}
              color={String(color)}
              size={size}
              active="add-circle"
              inactive="add-circle-outline"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              focused={focused}
              color={String(color)}
              size={size}
              active="person"
              inactive="person-outline"
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: lightColors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: lightColors.tabBarBorder,
    paddingTop: 4,
    height: Platform.OS === 'ios' ? 88 : 64,
  },
  tabLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    marginTop: 2,
  },
});
