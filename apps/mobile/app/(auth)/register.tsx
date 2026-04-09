import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { Box, Button, Icon, Screen, Text, TextField } from '../../components/ui';
import { useAppAlert } from '../../hooks/useAppAlert';
import { useAuth } from '../../hooks/useAuth';

export default function RegisterScreen() {
  const { register, isLoading } = useAuth();
  const { showError, showWarning } = useAppAlert();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) {
      showWarning('Campos obrigatorios', 'Preencha nome, e-mail e senha para continuar.');
      return;
    }

    if (password.length < 8) {
      showWarning('Senha muito curta', 'A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    try {
      await register(name, email, password);
    } catch (error: any) {
      showError('Erro ao criar conta', error.response?.data?.message ?? 'Erro ao criar conta');
    }
  };

  return (
    <Screen backgroundColor="primary">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
        >
          <Box px="xl" py="xl">
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
                Crie sua conta
              </Text>
            </Box>

            <Box gap="md">
              <TextField
                dark
                placeholder="Seu nome"
                value={name}
                onChangeText={setName}
                leftIconName="account-outline"
              />
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
                placeholder="Senha (min. 8 caracteres)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                leftIconName="lock-outline"
              />

              <Button variant="primary" onPress={handleRegister} loading={isLoading}>
                Criar conta
              </Button>

              <Link href="/(auth)/login" asChild>
                <TouchableOpacity style={{ alignItems: 'center' }}>
                  <Text variant="muted" color="white" opacity={0.7}>
                    Ja tem conta?{' '}
                    <Text variant="bodyStrong" color="accentLight">
                      Entrar
                    </Text>
                  </Text>
                </TouchableOpacity>
              </Link>
            </Box>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
