import { Stack } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect } from 'react';
import { useFonts } from 'expo-font';
import { AuthProvider } from '../src/context/AuthContext'; // ADD THIS IMPORT
import { I18nManager } from 'react-native';
SplashScreen.preventAutoHideAsync();

// ── إجبار التطبيق على RTL ومنع التبديل التلقائي ──
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);
I18nManager.doLeftAndRightSwapInRTL = true

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'NotoKufiArabic-Regular': require('../assets/fonts/NotoKufiArabic-Regular.ttf'),
    'NotoKufiArabic-Bold': require('../assets/fonts/NotoKufiArabic-Bold.ttf'),
    'Amiri-Regular': require('../assets/fonts/Amiri-Regular.ttf'),
    'NotoKufiArabic-SemiBold': require('../assets/fonts/NotoKufiArabic-SemiBold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;
  
  return (
    <SafeAreaView
      style={{ flex: 1 }}
      edges={['bottom', 'left', 'right']}
    >
      <StatusBar
        hidden={true}
        translucent={true}
      />
      {/* WRAP STACK WITH AUTH PROVIDER */}
      <AuthProvider>
        <Stack>
          <Stack.Screen name="index" options={{ title: "home", headerShown: false }} />
          <Stack.Screen name="home" options={{ title: "home", headerShown: false }} />
          <Stack.Screen name="loginpage" options={{ title: "login", headerShown: false }} />
          <Stack.Screen name="newAccount" options={{ title: "NewAccount", headerShown: false }} />
          <Stack.Screen name="newAccount2" options={{ title: "NewAccount2", headerShown: false }} />
          <Stack.Screen name="welcome" options={{ title: "welcome", headerShown: false }} />
          <Stack.Screen name="gallary" options={{ title: "gallary", headerShown: false }} />
          <Stack.Screen name="profile" options={{ title: "profile", headerShown: false }} />
          <Stack.Screen name="editAccount" options={{ title: "editAccount", headerShown: false }} />
          <Stack.Screen name="editAccount2" options={{ title: "editAccount2", headerShown: false }} />
          <Stack.Screen name="notifications" options={{ title: "notifications", headerShown: false }} />
          <Stack.Screen name="confedit" options={{ title: "confedit", headerShown: false }} />
          <Stack.Screen name="settings" options={{ title: "settings", headerShown: false }} />
          <Stack.Screen name="search" options={{ title: "search", headerShown: false }} />
          <Stack.Screen name="reg" options={{ title: "reg", headerShown: false }} />
          <Stack.Screen name="confreg" options={{ title: "confreg", headerShown: false }} />
          <Stack.Screen name="favoritepage" options={{ title: "favoritepage", headerShown: false }} />
          <Stack.Screen name="signup" options={{ title: "signup", headerShown: false }} />
          <Stack.Screen name="edit" options={{ title: "edit", headerShown: false }} />
          <Stack.Screen name="CardDitals" options={{ title: "CardDitals", headerShown: false }} />
          <Stack.Screen name="Calendar" options={{ title: "Calendar", headerShown: false }} />
          <Stack.Screen name="CalenderOwner" options={{ title: "CalendarOwner", headerShown: false }} />
          <Stack.Screen name="HajesAqar" options={{ title: "HajesAqar", headerShown: false }} />
          <Stack.Screen name="Done" options={{ title: "Done", headerShown: false }} />
          <Stack.Screen name="DoneOwner" options={{ title: "DoneOwner", headerShown: false }} />
          <Stack.Screen name="addComment" options={{ title: "addComment", headerShown: false }} />
          <Stack.Screen name="addCommentOwner" options={{ title: "addCommentOwner", headerShown: false }} />
          <Stack.Screen name="CardDitalsOwner" options={{ title: "CardDitalsOwner", headerShown: false }} />
          <Stack.Screen name="MyBooks" options={{ title: "MyBooks", headerShown: false }} />
          <Stack.Screen name="DaysOff" options={{ title: "DaysOff", headerShown: false }} />
          <Stack.Screen name="signupPerson" options={{ title: "signupPerson", headerShown: false }} />
          <Stack.Screen name="signupUser" options={{ title: "signupUser", headerShown: false }} />

          <Stack.Screen name="+not-found" />
        </Stack>
      </AuthProvider>
    </SafeAreaView>
  );
}