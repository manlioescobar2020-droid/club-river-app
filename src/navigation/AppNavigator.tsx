import React from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { ActivityIndicator, View } from "react-native"
import { useAuth } from "../context/AuthContext"
import { LoginScreen } from "../screens/auth/LoginScreen"
import { HomeScreen } from "../screens/dashboard/HomeScreen"
import type { AuthStackParamList, AppTabParamList } from "../types"

const AuthStack = createStackNavigator<AuthStackParamList>()
const AppTab    = createBottomTabNavigator<AppTabParamList>()

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  )
}

function AppNavigatorTabs() {
  return (
    <AppTab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#DC2626",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: { borderTopColor: "#f3f4f6", paddingBottom: 4 },
        headerStyle: { backgroundColor: "#fff" },
        headerTintColor: "#111",
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <AppTab.Screen name="Inicio"  component={HomeScreen} options={{ title: "Inicio" }} />
    </AppTab.Navigator>
  )
}

export function AppNavigator() {
  const { session, isLoading } = useAuth()

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    )
  }

  return (
    <NavigationContainer>
      {session ? <AppNavigatorTabs /> : <AuthNavigator />}
    </NavigationContainer>
  )
}
