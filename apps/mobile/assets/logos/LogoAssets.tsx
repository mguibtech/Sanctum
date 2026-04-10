/**
 * LogoAssets - SVG assets para exportar como PNG
 *
 * Use este arquivo para:
 * 1. Exportar como icon.png (512x512)
 * 2. Exportar como adaptive-icon.png (108x108)
 * 3. Exportar como notification-icon.png (96x96)
 * 4. Usar em splash screen
 */

import Svg, { G, Path, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

/**
 * Logo Padrão - S com chama
 * Exportar em: 512x512 px para App Icon
 */
export function LogoIcon() {
  return (
    <Svg width={512} height={512} viewBox="0 0 512 512" fill="none">
      {/* Background Circle */}
      <Rect width={512} height={512} fill="#16324F" />

      {/* Outer Decorative Circle */}
      <Defs>
        <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#C8A45A" stopOpacity="0.2" />
          <Stop offset="100%" stopColor="#C8A45A" stopOpacity="0" />
        </LinearGradient>
      </Defs>

      <G transform="translate(256, 256)">
        {/* S Shape - Main Logo */}
        <G transform="scale(3)">
          {/* Top curve of S */}
          <Path
            d="M 24 16 Q 20 16 20 20 Q 20 24 24 24 L 40 24 Q 44 24 44 28 Q 44 32 40 32 L 24 32"
            stroke="#C8A45A"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Bottom curve of S */}
          <Path
            d="M 40 32 Q 44 32 44 36 Q 44 40 40 40 L 24 40 Q 20 40 20 44 Q 20 48 24 48 L 40 48"
            stroke="#C8A45A"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Flame accent - right side flowing up */}
          <Path
            d="M 44 32 Q 48 28 50 20 Q 52 24 50 32 Q 52 32 50 40 Q 48 48 44 52"
            stroke="#C8A45A"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.7"
          />
        </G>
      </G>
    </Svg>
  );
}

/**
 * Adaptive Icon - Para Android (background + foreground)
 * Exportar em: 108x108 px
 */
export function AdaptiveIconBackground() {
  return (
    <Svg width={108} height={108} viewBox="0 0 108 108" fill="none">
      <Rect width={108} height={108} fill="#16324F" />
    </Svg>
  );
}

export function AdaptiveIconForeground() {
  return (
    <Svg width={108} height={108} viewBox="0 0 108 108" fill="none">
      <G transform="translate(54, 54)">
        <G transform="scale(1.5)">
          {/* S Shape */}
          <Path
            d="M 24 16 Q 20 16 20 20 Q 20 24 24 24 L 40 24 Q 44 24 44 28 Q 44 32 40 32 L 24 32"
            stroke="#C8A45A"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <Path
            d="M 40 32 Q 44 32 44 36 Q 44 40 40 40 L 24 40 Q 20 40 20 44 Q 20 48 24 48 L 40 48"
            stroke="#C8A45A"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <Path
            d="M 44 32 Q 48 28 50 20 Q 52 24 50 32 Q 52 32 50 40 Q 48 48 44 52"
            stroke="#C8A45A"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.7"
          />
        </G>
      </G>
    </Svg>
  );
}

/**
 * Notification Icon - Simples
 * Exportar em: 96x96 px
 */
export function NotificationIcon() {
  return (
    <Svg width={96} height={96} viewBox="0 0 96 96" fill="none">
      <Rect width={96} height={96} fill="white" />
      <G transform="translate(48, 48)">
        <G transform="scale(1.2)">
          {/* Simplified S for notification */}
          <Path
            d="M 24 16 Q 20 16 20 20 Q 20 24 24 24 L 40 24 Q 44 24 44 28 Q 44 32 40 32 L 24 32"
            stroke="#C8A45A"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <Path
            d="M 40 32 Q 44 32 44 36 Q 44 40 40 40 L 24 40 Q 20 40 20 44 Q 20 48 24 48 L 40 48"
            stroke="#C8A45A"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>
      </G>
    </Svg>
  );
}

/**
 * Splash Screen Background
 * Full-screen with hero design
 */
export function SplashBackground() {
  return (
    <Svg width={1080} height={1920} viewBox="0 0 1080 1920" fill="none">
      {/* Primary background */}
      <Rect width={1080} height={1920} fill="#16324F" />

      {/* Top glow */}
      <G opacity="0.08">
        <Rect
          x={540}
          y={200}
          width={800}
          height={800}
          rx={400}
          fill="#C8A45A"
        />
      </G>

      {/* Bottom glow */}
      <G opacity="0.06">
        <Rect
          x={200}
          y={1400}
          width={900}
          height={900}
          rx={450}
          fill="#C8A45A"
        />
      </G>

      {/* Logo centered */}
      <G transform="translate(540, 800)">
        <G transform="scale(6)">
          {/* S Shape */}
          <Path
            d="M 24 16 Q 20 16 20 20 Q 20 24 24 24 L 40 24 Q 44 24 44 28 Q 44 32 40 32 L 24 32"
            stroke="#C8A45A"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <Path
            d="M 40 32 Q 44 32 44 36 Q 44 40 40 40 L 24 40 Q 20 40 20 44 Q 20 48 24 48 L 40 48"
            stroke="#C8A45A"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <Path
            d="M 44 32 Q 48 28 50 20 Q 52 24 50 32 Q 52 32 50 40 Q 48 48 44 52"
            stroke="#C8A45A"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.7"
          />
        </G>
      </G>
    </Svg>
  );
}
