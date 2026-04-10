import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Box, Button, Card, Badge, Divider, ActionCard, Logo, LogoWithText, Text, TextField, Screen } from '../ui';
import theme from '../../constants/theme';

/**
 * ComponentShowcase - Demonstra todos os componentes do Design System
 *
 * Use para testar e visualizar componentes
 * Remova de produção
 */
export function ComponentShowcase() {
  const [textValue, setTextValue] = useState('');

  return (
    <Screen backgroundColor="background">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.xl }}
      >
        {/* Header */}
        <Box alignItems="center" gap="md">
          <LogoWithText size={48} variant="accent" textSize={20} />
          <Text variant="subheading" color="primary">
            Component Showcase
          </Text>
        </Box>

        <Divider />

        {/* Buttons Section */}
        <Box gap="md">
          <Text variant="heading" color="primary">
            Buttons
          </Text>

          <Box gap="sm">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="tertiary">Tertiary Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="danger">Danger Button</Button>
            <Button disabled>Disabled Button</Button>
            <Button loading>Loading...</Button>
          </Box>

          <Box flexDirection="row" gap="sm">
            <Box flex={1}>
              <Button size="sm">Small</Button>
            </Box>
            <Box flex={1}>
              <Button size="md">Medium</Button>
            </Box>
            <Box flex={1}>
              <Button size="lg">Large</Button>
            </Box>
          </Box>
        </Box>

        <Divider />

        {/* Cards Section */}
        <Box gap="md">
          <Text variant="heading" color="primary">
            Cards
          </Text>

          <Card variant="default">
            <Text variant="bodyStrong" color="primary" mb="sm">
              Default Card
            </Text>
            <Text variant="body" color="text">
              This is a default card with border and subtle shadow.
            </Text>
          </Card>

          <Card variant="elevated">
            <Text variant="bodyStrong" color="primary" mb="sm">
              Elevated Card
            </Text>
            <Text variant="body" color="text">
              This card has a more pronounced shadow for elevation.
            </Text>
          </Card>

          <Card variant="inset">
            <Text variant="bodyStrong" color="primary" mb="sm">
              Inset Card
            </Text>
            <Text variant="body" color="text">
              This card uses a muted background color.
            </Text>
          </Card>
        </Box>

        <Divider />

        {/* Badges Section */}
        <Box gap="md">
          <Text variant="heading" color="primary">
            Badges
          </Text>

          <Box flexDirection="row" flexWrap="wrap" gap="sm">
            <Badge variant="primary">Primary</Badge>
            <Badge variant="accent">Accent</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
          </Box>
        </Box>

        <Divider />

        {/* Text Fields Section */}
        <Box gap="md">
          <Text variant="heading" color="primary">
            Text Fields
          </Text>

          <TextField
            label="Default Input"
            placeholder="Type something..."
            value={textValue}
            onChangeText={setTextValue}
          />

          <TextField
            label="With Helper Text"
            placeholder="Helper text below"
            helperText="This is a helper text"
            value={textValue}
            onChangeText={setTextValue}
          />

          <TextField
            label="With Error"
            placeholder="Error state"
            error="This field is required"
            value={textValue}
            onChangeText={setTextValue}
          />

          <TextField
            label="Disabled"
            placeholder="Cannot edit"
            disabled
            value="Disabled field"
          />

          <TextField
            label="Password"
            placeholder="Type your password"
            secureTextEntry
            value={textValue}
            onChangeText={setTextValue}
          />

          <TextField
            label="With Icon"
            leftIconName="account-circle-outline"
            placeholder="Search users..."
            value={textValue}
            onChangeText={setTextValue}
          />

          <TextField
            label="Multiline"
            placeholder="Write your message..."
            multiline
            value={textValue}
            onChangeText={setTextValue}
          />
        </Box>

        <Divider />

        {/* Action Cards Section */}
        <Box gap="md">
          <Text variant="heading" color="primary">
            Action Cards
          </Text>

          <ActionCard
            title="Bible"
            subtitle="Read and save passages"
            icon="book-open-variant"
            onPress={() => {}}
          />

          <ActionCard
            title="Rosary"
            subtitle="Guided prayer"
            icon="hands-pray"
            onPress={() => {}}
            backgroundColor="#1D4267"
          />

          <ActionCard
            title="Community"
            subtitle="Prayer intentions"
            icon="hand-heart-outline"
            onPress={() => {}}
            backgroundColor="#EDE3CE"
            isDark={false}
          />
        </Box>

        <Divider />

        {/* Logo Section */}
        <Box gap="md">
          <Text variant="heading" color="primary">
            Logos
          </Text>

          <Box gap="md" alignItems="center">
            <Box gap="sm" alignItems="center">
              <Text variant="caption" color="textMuted">
                Accent Logo
              </Text>
              <Logo size={64} variant="accent" />
            </Box>

            <Box gap="sm" alignItems="center">
              <Text variant="caption" color="textMuted">
                White Logo
              </Text>
              <Card variant="elevated">
                <Box alignItems="center" py="lg">
                  <Logo size={64} variant="white" />
                </Box>
              </Card>
            </Box>

            <Box gap="sm" alignItems="center">
              <Text variant="caption" color="textMuted">
                With Text
              </Text>
              <LogoWithText size={48} variant="accent" />
            </Box>
          </Box>
        </Box>

        <Divider />

        {/* Typography Section */}
        <Box gap="md">
          <Text variant="heading" color="primary">
            Typography
          </Text>

          <Text variant="display" color="primary">
            Display (42px, bold)
          </Text>

          <Text variant="hero" color="primary">
            Hero (36px, bold)
          </Text>

          <Text variant="heading" color="primary">
            Heading (28px, bold)
          </Text>

          <Text variant="subheading" color="primary">
            Subheading (20px, medium)
          </Text>

          <Text variant="body" color="text">
            Body (15px, regular) — Default paragraph text for content
          </Text>

          <Text variant="muted" color="textMuted">
            Body Small (13px, regular) — Secondary text or labels
          </Text>

          <Text variant="caption" color="textMuted">
            Caption (11px, regular) — Very small text like hints
          </Text>
        </Box>

        {/* Spacing */}
        <Box height={100} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    gap: theme.spacing.xl,
  },
});
