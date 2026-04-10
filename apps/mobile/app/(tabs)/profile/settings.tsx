import { Link } from 'expo-router';
import { Modal, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Box, Icon, Screen, Text } from '../../../components/ui';
import theme from '../../../constants/theme';
import { useThemeMode, type ThemeMode } from '../../../hooks/useThemeMode';

type SettingItemProps = {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
};

function SettingItem({ icon, title, subtitle, onPress }: SettingItemProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.6} style={styles.settingItem}>
      <Box flexDirection="row" alignItems="center" gap="md" flex={1}>
        <Box
          width={40}
          height={40}
          borderRadius="sm"
          alignItems="center"
          justifyContent="center"
          style={{ backgroundColor: theme.colors.accentMuted }}
        >
          <Icon name={icon} size={20} color="accent" />
        </Box>
        <Box flex={1}>
          <Text variant="body" color="text">
            {title}
          </Text>
          {subtitle && (
            <Text variant="caption" color="textMuted">
              {subtitle}
            </Text>
          )}
        </Box>
      </Box>
      <Icon name="chevron-right" size={20} color="textMuted" />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { themeMode, setThemeMode } = useThemeMode();
  const [showThemeModal, setShowThemeModal] = useState(false);

  const getThemeLabel = (mode: ThemeMode) => {
    switch (mode) {
      case 'light':
        return 'Claro';
      case 'dark':
        return 'Escuro';
      case 'auto':
        return 'Automático';
    }
  };

  const handleThemeSelect = (mode: ThemeMode) => {
    setThemeMode(mode);
    setShowThemeModal(false);
  };

  return (
    <Screen>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Box
          flexDirection="row"
          alignItems="center"
          gap="md"
          px="lg"
          py="lg"
          style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.border }}
        >
          <Link href="../" asChild>
            <TouchableOpacity hitSlop={8}>
              <Icon name="chevron-left" size={28} color="text" />
            </TouchableOpacity>
          </Link>
          <Text variant="heading" color="text" flex={1}>
            Configurações
          </Text>
        </Box>

        <Box px="lg" py="lg">
          {/* Account Section */}
          <Text variant="subheading" color="primary" mb="md">
            Conta
          </Text>

          <Box style={styles.section} mb="lg">
            <SettingItem
              icon="account-edit-outline"
              title="Editar Perfil"
              subtitle="Atualize seus dados pessoais"
              onPress={() => {}}
            />
            <SettingItem
              icon="bell-outline"
              title="Notificações"
              subtitle="Gerencie alertas e lembretes"
              onPress={() => {}}
            />
            <SettingItem
              icon="lock-outline"
              title="Privacidade"
              subtitle="Controle seu perfil e dados"
              onPress={() => {}}
            />
          </Box>

          {/* App Section */}
          <Text variant="subheading" color="primary" mb="md">
            Aplicativo
          </Text>

          <Box style={styles.section} mb="lg">
            <SettingItem
              icon="palette-outline"
              title="Tema"
              subtitle={getThemeLabel(themeMode)}
              onPress={() => setShowThemeModal(true)}
            />
            <SettingItem
              icon="translate"
              title="Idioma"
              subtitle="Português (Brasil)"
              onPress={() => {}}
            />
            <SettingItem
              icon="bell-ring-outline"
              title="Sons e Vibrações"
              subtitle="Gerenciar feedback sensorial"
              onPress={() => {}}
            />
          </Box>

          {/* Help Section */}
          <Text variant="subheading" color="primary" mb="md">
            Ajuda e Suporte
          </Text>

          <Box style={styles.section} mb="lg">
            <SettingItem
              icon="information-outline"
              title="Sobre o Sanctum"
              subtitle="Versão 1.0.0"
              onPress={() => {}}
            />
            <SettingItem
              icon="help-circle-outline"
              title="Dúvidas Frequentes"
              subtitle="Respostas para dúvidas comuns"
              onPress={() => {}}
            />
            <SettingItem
              icon="email-outline"
              title="Enviar Feedback"
              subtitle="Compartilhe suas sugestões"
              onPress={() => {}}
            />
            <SettingItem
              icon="file-document-outline"
              title="Termos de Serviço"
              subtitle="Leia nossos termos"
              onPress={() => {}}
            />
            <SettingItem
              icon="shield-account-outline"
              title="Política de Privacidade"
              subtitle="Como protegemos seus dados"
              onPress={() => {}}
            />
          </Box>

          {/* Danger Zone */}
          <Text variant="subheading" color="error" mb="md">
            Zona de Risco
          </Text>

          <Box style={styles.section}>
            <TouchableOpacity activeOpacity={0.6} style={[styles.settingItem, styles.dangerItem]}>
              <Box flexDirection="row" alignItems="center" gap="md" flex={1}>
                <Box
                  width={40}
                  height={40}
                  borderRadius="sm"
                  alignItems="center"
                  justifyContent="center"
                  style={{ backgroundColor: theme.colors.errorLight }}
                >
                  <Icon name="delete-outline" size={20} color="error" />
                </Box>
                <Box flex={1}>
                  <Text variant="body" color="error">
                    Deletar Conta
                  </Text>
                  <Text variant="caption" color="textMuted">
                    Remover permanentemente sua conta
                  </Text>
                </Box>
              </Box>
              <Icon name="chevron-right" size={20} color="error" />
            </TouchableOpacity>
          </Box>
        </Box>
      </ScrollView>

      {/* Theme Selection Modal */}
      <Modal
        visible={showThemeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <Box
          style={{ flex: 1, backgroundColor: theme.colors.overlay }}
          justifyContent="flex-end"
        >
          <Box
            style={{
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: theme.borderRadii.lg,
              borderTopRightRadius: theme.borderRadii.lg,
              paddingVertical: theme.spacing.lg,
              paddingHorizontal: theme.spacing.lg,
            }}
          >
            <Box
              alignItems="center"
              mb="lg"
              pb="md"
              style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.border }}
            >
              <Text variant="heading" color="text">
                Selecionar Tema
              </Text>
            </Box>

            <Box gap="sm">
              {(['light', 'dark', 'auto'] as ThemeMode[]).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  onPress={() => handleThemeSelect(mode)}
                  activeOpacity={0.6}
                  style={[
                    styles.themeOption,
                    {
                      backgroundColor:
                        themeMode === mode
                          ? theme.colors.accentMuted
                          : theme.colors.backgroundSoft,
                      borderColor:
                        themeMode === mode ? theme.colors.accent : theme.colors.border,
                    },
                  ]}
                >
                  <Box flexDirection="row" alignItems="center" gap="md" flex={1}>
                    <Icon
                      name={
                        mode === 'light'
                          ? 'white-balance-sunny'
                          : mode === 'dark'
                            ? 'moon-waning-crescent'
                            : 'brightness-auto'
                      }
                      size={24}
                      color={themeMode === mode ? 'accent' : 'textMuted'}
                    />
                    <Box flex={1}>
                      <Text
                        variant="body"
                        color={themeMode === mode ? 'accent' : 'text'}
                        style={{ fontWeight: themeMode === mode ? '700' : '400' }}
                      >
                        {getThemeLabel(mode)}
                      </Text>
                      <Text variant="caption" color="textMuted">
                        {mode === 'light'
                          ? 'Sempre modo claro'
                          : mode === 'dark'
                            ? 'Sempre modo escuro'
                            : 'Seguir preferência do sistema'}
                      </Text>
                    </Box>
                  </Box>
                  {themeMode === mode && (
                    <Icon name="check-circle" size={24} color="accent" />
                  )}
                </TouchableOpacity>
              ))}
            </Box>

            <TouchableOpacity
              onPress={() => setShowThemeModal(false)}
              activeOpacity={0.6}
              style={[
                styles.themeOption,
                {
                  backgroundColor: theme.colors.backgroundSoft,
                  borderColor: theme.colors.border,
                  marginTop: theme.spacing.md,
                },
              ]}
            >
              <Text variant="body" color="text" style={{ textAlign: 'center', fontWeight: '600' }}>
                Fechar
              </Text>
            </TouchableOpacity>
          </Box>
        </Box>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadii.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  dangerItem: {
    borderBottomWidth: 0,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadii.md,
    borderWidth: 1,
  },
});
