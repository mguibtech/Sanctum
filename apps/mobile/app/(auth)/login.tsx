import { useState } from 'react';
import { KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useAppAlert } from '../../hooks/useAppAlert';
import { Box, Button, Icon, Screen, Text, TextField } from '../../components/ui';

export default function LoginScreen() {
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
        style={{ flex: 1, justifyContent: 'center' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Box px="xl">
          <Box alignItems="center" mb="2xl">
            <Box
              alignItems="center"
              borderColor="accent"
              borderRadius="full"
              borderWidth={1}
              height={72}
              justifyContent="center"
              mb="md"
              style={{ backgroundColor: 'rgba(230,201,141,0.12)' }}
              width={72}
            >
              <Icon name="cross-celtic" size={34} color="accent" />
            </Box>
            <Text variant="hero">Sanctum</Text>
            <Text variant="body" color="white" opacity={0.7} mt="xs">
              Bem-vindo de volta
            </Text>
          </Box>

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

            <Button variant="primary" onPress={handleLogin} loading={isLoading}>
              Entrar
            </Button>

            <Link href="/(auth)/register" asChild>
              <TouchableOpacity style={{ alignItems: 'center' }}>
                <Text variant="muted" color="white" opacity={0.7}>
                  Ainda nao tem conta?{' '}
                  <Text variant="bodyStrong" color="accentLight">
                    Cadastre-se
                  </Text>
                </Text>
              </TouchableOpacity>
            </Link>
          </Box>
        </Box>
      </KeyboardAvoidingView>
    </Screen>
  );
}
