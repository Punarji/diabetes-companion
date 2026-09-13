import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // npm i @react-navigation/native-stack

import SplashScreen from '../screens/onboarding/SplashScreen';
import OnboardingCarousel from '../screens/onboarding/OnboardingCarousel';
import RoleSelectionScreen from '../screens/auth/RoleSelectionScreen';
import CreateAccountScreen from '../screens/auth/CreateAccountScreen';
import SignInScreen from '../screens/auth/SignInScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import HealthProfileStep1Screen from '../screens/onboarding/HealthProfileStep1Screen';
import LifestyleStep2Screen from '../screens/onboarding/LifestyleStep2Screen';
import NotificationsStep3Screen from '../screens/onboarding/NotificationsStep3Screen';
import RiskFactorsScreen from '../screens/risk/RiskFactorsScreen';
import RiskQuestionScreen from '../screens/risk/RiskQuestionScreen';
import AnalysingDataScreen from '../screens/risk/AnalysingDataScreen';
import RiskResultScreen from '../screens/risk/RiskResultScreen';
import HomeDashboardScreen from '../screens/home/HomeDashboardScreen';
import MedicationsScreen from '../screens/medications/MedicationsScreen';
import LogMedicationModal from '../screens/medications/LogMedicationModal';
import CarePlanScreen from '../screens/careplan/CarePlanScreen';
import LogMealScreen from '../screens/meals/LogMealScreen';
import MealPlanScreen from '../screens/meals/MealPlanScreen';
import ActivityScreen from '../screens/activity/ActivityScreen';
import LogExerciseScreen from '../screens/activity/LogExerciseScreen';
import AchievementScreen from '../screens/achievements/AchievementScreen';

// New screens
import GlucoseLogScreen from '../screens/GlucoseLog/GlucoseLogScreen';
import GlucoseDashboardScreen from '../screens/Dashboard/GlucoseDashboardScreen';
import MedicationDetailScreen from '../screens/medications/MedicationDetailScreen';
import ReminderSettingsScreen from '../screens/Reminders/ReminderSettingsScreen';
import ProfileSettingsScreen from '../screens/profile/ProfileSettingsScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import MyDoctorScreen from '../screens/doctor/MyDoctorScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import NutritionScreen from '../screens/nutrition/NutritionScreen';
import RecipeDetailScreen from '../screens/recipe/RecipeDetailScreen';
import ProgressScreen from '../screens/progress/ProgressScreen';
import PhysicianHomeScreen from '../screens/physician/PhysicianHomeScreen';
import PatientReportScreen from '../screens/physician/PatientReportScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Onboarding */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="OnboardingCarousel" component={OnboardingCarousel} />

        {/* Auth */}
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

        {/* Profile setup (post-registration) */}
        <Stack.Screen name="HealthProfileStep1" component={HealthProfileStep1Screen} />
        <Stack.Screen name="LifestyleStep2" component={LifestyleStep2Screen} />
        <Stack.Screen name="NotificationsStep3" component={NotificationsStep3Screen} />

        {/* Risk assessment */}
        <Stack.Screen name="RiskFactors" component={RiskFactorsScreen} />
        <Stack.Screen name="RiskQuestionnaire" component={RiskQuestionScreen} />
        <Stack.Screen name="AnalysingData" component={AnalysingDataScreen} />
        <Stack.Screen name="RiskResult" component={RiskResultScreen} />

        {/* Main app */}
        <Stack.Screen name="HomeDashboard" component={HomeDashboardScreen} />
        <Stack.Screen name="Medications" component={MedicationsScreen} />
        <Stack.Screen
          name="LogMedicationModal"
          component={LogMedicationModal}
          options={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="CarePlan" component={CarePlanScreen} />

        {/* Meals */}
        <Stack.Screen
          name="LogMeal"
          component={LogMealScreen}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="MealPlan" component={MealPlanScreen} />

        {/* Activity */}
        <Stack.Screen name="Activity" component={ActivityScreen} />
        <Stack.Screen
          name="LogExercise"
          component={LogExerciseScreen}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />

        {/* Achievements */}
        <Stack.Screen name="Achievement" component={AchievementScreen} />

        {/* Aliases for bottom-nav route names used by new screens */}
        <Stack.Screen name="Home" component={HomeDashboardScreen} />
        <Stack.Screen name="Meals" component={NutritionScreen} />
        <Stack.Screen name="Profile" component={ProfileSettingsScreen} />

        {/* Glucose */}
        <Stack.Screen name="GlucoseLog" component={GlucoseLogScreen} />
        <Stack.Screen name="GlucoseDashboard" component={GlucoseDashboardScreen} />

        {/* Medications */}
        <Stack.Screen name="MedicationDetail" component={MedicationDetailScreen} />

        {/* Reminders */}
        <Stack.Screen name="ReminderSettings" component={ReminderSettingsScreen} />

        {/* Profile & Doctor */}
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="MyDoctor" component={MyDoctorScreen} />

        {/* Notifications */}
        <Stack.Screen name="Notifications" component={NotificationsScreen} />

        {/* Nutrition & Recipes */}
        <Stack.Screen name="Nutrition" component={NutritionScreen} />
        <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />

        {/* Progress */}
        <Stack.Screen name="Progress" component={ProgressScreen} />

        {/* Physician */}
        <Stack.Screen name="PhysicianHome" component={PhysicianHomeScreen} />
        <Stack.Screen name="PatientReport" component={PatientReportScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
