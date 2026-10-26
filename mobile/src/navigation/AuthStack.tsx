import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../features/auth/screens/LoginScreen';
import { RegisterScreen } from '../features/auth/screens/RegisterScreen';
import { AccountStatusScreen } from '../features/auth/screens/AccountStatusScreen';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  AccountStatus: { status: 'pending' | 'locked' };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * AuthStack: Điều hướng giữa các màn hình xác thực:
 * Login (SCR-A02) -> Register (SCR-A03) -> AccountStatus (SCR-A04).
 */
export const AuthStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login">
        {({ navigation }) => (
          <LoginScreen
            onNavigateToRegister={() => navigation.navigate('Register')}
            onNavigateToAccountStatus={(status) => navigation.navigate('AccountStatus', { status })}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Register">
        {({ navigation }) => (
          <RegisterScreen
            onNavigateBack={() => navigation.goBack()}
            onNavigateToPendingApproval={() =>
              navigation.navigate('AccountStatus', { status: 'pending' })
            }
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="AccountStatus">
        {({ route, navigation }) => (
          <AccountStatusScreen
            status={route.params?.status ?? 'pending'}
            onNavigateToLogin={() => navigation.navigate('Login')}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};
