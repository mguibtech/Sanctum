import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useAppAlert } from '../../hooks/useAppAlert';
import { Box, Button, Icon, Screen, Text, TextField } from '../../components/ui';
import theme from '../../constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const { showError, showWarning } = useAppAlert();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      showWarning('Campos obrigatorios', 'Preencha e-mail e senha para continuar.');
      return;
    }

    try {
      await login(email, password);
    } catch (error: any) {
      showError('Erro ao entrar', error.response?.data?.message ?? 'Credenciais invalidas');
    }
  };

  return (
    <Screen backgroundColor="primary">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <Box alignItems="center" py="2xl" px="xl">
            <Box
              alignItems="center"
              borderColor="accent"
              borderRadius="full"
              borderWidth={2}
              height={80}
              justifyContent="center"
              mb="lg"
              style={{ backgroundColor: 'rgba(230,201,141,0.15)' }}
              width={80}
            >
              <Icon name="cross-celtic" size={40} color="accent" />
            </Box>
            <Text variant="display" color="white" mb="xs">
              Sanctum
            </Text>
            <Text variant="body" color="white" opacity={0.8}>
              Bem-vindo de volta
            </Text>
          </Box>

          {/* Form Section */}
          <Box px="xl" py="xl" gap="lg">
            {/* Login Inputs */}
            <Box gap="md">
              <TextField
                dark
                placeholder="E-mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIconName="email-outline"
              />
              <TextField
                dark
                placeholder="Senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                leftIconName="lock-outline"
              />

              {/* Forgot Password Link */}
              <Box alignItems="flex-end">
                <TouchableOpacity hitSlop={8}>
                  <Text variant="caption" color="accentLight">
                    Esqueceu a senha?
                  </Text>
                </TouchableOpacity>
              </Box>

              {/* Entrar Button */}
              <Button
                variant="tertiary"
                size="lg"
                onPress={handleLogin}
                loading={isLoading}
              >
                Entrar
              </Button>
            </Box>

            {/* Divider */}
            <Box flexDirection="row" alignItems="center" gap="md">
              <Box flex={1} height={1} style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
              <Text variant="caption" color="white" opacity={0.6}>
                OU
              </Text>
              <Box flex={1} height={1} style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
            </Box>

            {/* Sign Up Section */}
            <Box
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: 'rgba(230,201,141,0.2)',
                padding: 16,
              }}
              alignItems="center"
              gap="sm"
            >
              <Text variant="body" color="white" opacity={0.8}>
                Ainda não tem conta?
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/register')}
                activeOpacity={0.7}
                style={{
                  paddingHorizontal: 32,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: theme.colors.accent,
                  borderWidth: 0,
                  minWidth: 160,
                  alignItems: 'center',
                }}
              >
                <Text
                  variant="bodyStrong"
                  color="primary"
                  style={{ textAlign: 'center', fontWeight: '700' }}
                >
                  Cadastre-se
                </Text>
              </TouchableOpacity>
            </Box>
          </Box>

          {/* Bottom Spacing */}
          <Box height={40} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
