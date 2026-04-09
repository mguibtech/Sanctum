/**
 * LiturgyText
 *
 * Renderiza o texto litúrgico destacando automaticamente:
 *  - Números de versículos embutidos no texto (ex: "13Naquele", "1Pedro")
 *  - Refrão do salmo (linhas que começam com "R:")
 *  - Estrofes do salmo (linhas que começam com "-")
 *  - Discurso direto entre aspas
 */

import { StyleSheet, Text, View } from 'react-native';
import theme from '../../constants/theme';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Segment =
  | { kind: 'verse-num'; num: string }
  | { kind: 'text'; value: string };

type Block =
  | { type: 'verse-line'; segments: Segment[] }
  | { type: 'refrain'; text: string }           // R:
  | { type: 'strophe'; text: string }           // -
  | { type: 'plain'; text: string };

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Quebra um texto em segmentos, separando números de versículo do texto.
 * Padrão: dígitos imediatamente seguidos de letra maiúscula ou aspas
 * Ex: "13Naquele tempo" → [{num:'13'}, {text:'Naquele tempo'}]
 */
function parseVerseSegments(raw: string): Segment[] {
  const segments: Segment[] = [];
  // Regex: captura (números)(resto até o próximo número-de-versículo ou fim)
  const regex = /(\d+)([A-ZÁÉÍÓÚÀÃÂÊÔÕÜÇÑ"'"'(])/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(raw)) !== null) {
    const numStart = match.index;
    // texto antes do número
    if (numStart > lastIndex) {
      segments.push({ kind: 'text', value: raw.slice(lastIndex, numStart) });
    }
    segments.push({ kind: 'verse-num', num: match[1] });
    // recua o regex para não consumir a letra que vem depois do número
    regex.lastIndex = numStart + match[1].length;
    lastIndex = regex.lastIndex;
  }

  // texto restante
  if (lastIndex < raw.length) {
    segments.push({ kind: 'text', value: raw.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ kind: 'text', value: raw }];
}

/**
 * Analisa o texto completo e retorna blocos tipados.
 * Trata tanto gospel/leituras (texto contínuo com versículos embutidos)
 * quanto salmos (R: / - / texto livre).
 */
function parseBlocks(raw: string): Block[] {
  const lines = raw.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const blocks: Block[] = [];

  for (const line of lines) {
    if (/^R[:.]?\s*/i.test(line)) {
      // Refrão do salmo: "R: Exulte o coração..."
      blocks.push({ type: 'refrain', text: line.replace(/^R[:.]?\s*/i, '') });
    } else if (/^[-–—]\s+/.test(line)) {
      // Estrofe do salmo: "- Dai graças ao Senhor..."
      blocks.push({ type: 'strophe', text: line.replace(/^[-–—]\s+/, '') });
    } else {
      // Leitura / evangelho: pode ter versículos embutidos
      const segments = parseVerseSegments(line);
      const hasVerseNum = segments.some((s) => s.kind === 'verse-num');
      if (hasVerseNum) {
        blocks.push({ type: 'verse-line', segments });
      } else {
        blocks.push({ type: 'plain', text: line });
      }
    }
  }

  return blocks;
}

// ─── Renderizadores de bloco ──────────────────────────────────────────────────

function VerseLineBlock({ segments }: { segments: Segment[] }) {
  return (
    <Text style={styles.verseLine}>
      {segments.map((seg, i) => {
        if (seg.kind === 'verse-num') {
          return (
            <Text key={i} style={styles.verseNumber}>
              {seg.num}{' '}
            </Text>
          );
        }
        return <Text key={i}>{seg.value}</Text>;
      })}
    </Text>
  );
}

function RefrainBlock({ text }: { text: string }) {
  return (
    <View style={styles.refrainContainer}>
      <View style={styles.refrainAccent} />
      <View style={styles.refrainContent}>
        <Text style={styles.refrainLabel}>R</Text>
        <Text style={styles.refrainText}>{text}</Text>
      </View>
    </View>
  );
}

function StropheBlock({ text }: { text: string }) {
  return (
    <View style={styles.stropheContainer}>
      <Text style={styles.stropheBullet}>—</Text>
      <Text style={styles.stropheText}>{text}</Text>
    </View>
  );
}

function PlainBlock({ text }: { text: string }) {
  return <Text style={styles.plainText}>{text}</Text>;
}

// ─── Componente principal ─────────────────────────────────────────────────────

type LiturgyTextProps = {
  text: string;
  /** 'reading' para leituras/evangelho, 'psalm' para salmos */
  variant?: 'reading' | 'psalm';
};

export function LiturgyText({ text, variant = 'reading' }: LiturgyTextProps) {
  if (!text) return null;
  const blocks = parseBlocks(text);

  return (
    <View style={styles.container}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'verse-line':
            return <VerseLineBlock key={i} segments={block.segments} />;
          case 'refrain':
            return <RefrainBlock key={i} text={block.text} />;
          case 'strophe':
            return <StropheBlock key={i} text={block.text} />;
          case 'plain':
          default:
            return <PlainBlock key={i} text={block.text} />;
        }
      })}
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },

  // Leitura / Evangelho
  verseLine: {
    fontSize: 15,
    lineHeight: 25,
    color: theme.colors.text,
  },
  verseNumber: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.accent,
    letterSpacing: 0.5,
    // Efeito de superscript aproximado
    lineHeight: 18,
  },
  plainText: {
    fontSize: 15,
    lineHeight: 25,
    color: theme.colors.text,
    fontStyle: 'italic',
  },

  // Salmo — Refrão
  refrainContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.accentMuted,
    borderRadius: theme.borderRadii.sm,
    overflow: 'hidden',
    marginVertical: 4,
  },
  refrainAccent: {
    width: 4,
    backgroundColor: theme.colors.accent,
  },
  refrainContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
  },
  refrainLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.accent,
    letterSpacing: 1,
    marginTop: 2,
  },
  refrainText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 23,
    color: theme.colors.primary,
    fontWeight: '600',
    fontStyle: 'italic',
  },

  // Salmo — Estrofe
  stropheContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingLeft: 4,
  },
  stropheBullet: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  stropheText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 25,
    color: theme.colors.text,
  },
});
