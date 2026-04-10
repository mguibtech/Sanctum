import { Platform, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Icon } from '../../components/ui';
import theme from '../../constants/theme';

type TabIconProps = {
  color: string;
  name: string;
  focused: boolean;
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.4)',
        tabBarStyle: {
          backgroundColor: theme.colors.primaryDark,
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === 'ios' ? 82 : 68,
          paddingBottom: Platform.OS === 'ios' ? 22 : 10,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.25,
          shadowRadius: 16,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.2,
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'view-grid' : 'view-grid-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="rosary"
        options={{
          title: 'Terço',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="hands-pray" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="bible"
        options={{
          title: 'Bíblia',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'book-open-variant' : 'book-open-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Comunidade',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'hand-heart' : 'hand-heart-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'account-circle' : 'account-circle-outline'} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

function TabIcon({ color, name, focused }: TabIconProps) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Icon name={name} size={focused ? 24 : 22} color={color} />
      {focused && (
        <View
          style={{
            position: 'absolute',
            bottom: -6,
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: theme.colors.accent,
          }}
        />
      )}
    </View>
  );
}
