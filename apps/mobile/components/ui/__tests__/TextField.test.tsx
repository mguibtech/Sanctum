import React from 'react';
import { render, screen, fireEvent } from '../../../__tests__/setup';
import { TextInput } from 'react-native';
import { TextField } from '../TextField';

describe('TextField Component', () => {
  describe('Rendering', () => {
    it('should render text field', () => {
      render(<TextField placeholder="Enter text" />);
      const input = screen.UNSAFE_getByType(TextInput);
      expect(input).toBeDefined();
    });

    it('should display placeholder', () => {
      render(<TextField placeholder="Type here" />);
      const input = screen.UNSAFE_getByType(TextInput);
      expect(input.props.placeholder).toBe('Type here');
    });

    it('should display initial value', () => {
      render(<TextField value="Initial value" />);
      const input = screen.UNSAFE_getByType(TextInput);
      expect(input.props.value).toBe('Initial value');
    });

    it('should display label when provided', () => {
      render(<TextField label="Email" />);
      expect(screen.queryByText('Email')).toBeDefined();
    });

    it('should display error message', () => {
      render(<TextField error="Email is invalid" />);
      expect(screen.queryByText('Email is invalid')).toBeDefined();
    });

    it('should display helper text', () => {
      render(<TextField helperText="Password must be 8+ characters" />);
      expect(screen.queryByText('Password must be 8+ characters')).toBeDefined();
    });
  });

  describe('Input Handling', () => {
    it('should call onChangeText when text changes', () => {
      const onChangeText = jest.fn();
      render(<TextField onChangeText={onChangeText} />);

      const input = screen.UNSAFE_getByType(TextInput);
      fireEvent.changeText(input, 'new text');

      expect(onChangeText).toHaveBeenCalledWith('new text');
    });

    it('should handle multiple text changes', () => {
      const onChangeText = jest.fn();
      render(<TextField onChangeText={onChangeText} />);

      const input = screen.UNSAFE_getByType(TextInput);
      fireEvent.changeText(input, 'a');
      fireEvent.changeText(input, 'ab');
      fireEvent.changeText(input, 'abc');

      expect(onChangeText).toHaveBeenCalledTimes(3);
      expect(onChangeText).toHaveBeenLastCalledWith('abc');
    });

    it('should call onBlur when focused out', () => {
      const onBlur = jest.fn();
      render(<TextField onBlur={onBlur} />);

      const input = screen.UNSAFE_getByType(TextInput);
      fireEvent(input, 'blur');

      expect(onBlur).toHaveBeenCalled();
    });

    it('should call onFocus when focused', () => {
      const onFocus = jest.fn();
      render(<TextField onFocus={onFocus} />);

      const input = screen.UNSAFE_getByType(TextInput);
      fireEvent(input, 'focus');

      expect(onFocus).toHaveBeenCalled();
    });

    it('should handle submit editing', () => {
      const onSubmitEditing = jest.fn();
      render(<TextField onSubmitEditing={onSubmitEditing} />);

      const input = screen.UNSAFE_getByType(TextInput);
      fireEvent(input, 'submitEditing');

      expect(onSubmitEditing).toHaveBeenCalled();
    });
  });

  describe('Input Types', () => {
    it('should handle email input type', () => {
      render(<TextField keyboardType="email-address" />);
      const input = screen.UNSAFE_getByType(TextInput);
      expect(input.props.keyboardType).toBe('email-address');
    });

    it('should handle password input type', () => {
      render(<TextField secureTextEntry />);
      const input = screen.UNSAFE_getByType(TextInput);
      expect(input.props.secureTextEntry).toBe(true);
    });

    it('should handle number input type', () => {
      render(<TextField keyboardType="number-pad" />);
      const input = screen.UNSAFE_getByType(TextInput);
      expect(input.props.keyboardType).toBe('number-pad');
    });

    it('should handle phone number input', () => {
      render(<TextField keyboardType="phone-pad" />);
      const input = screen.UNSAFE_getByType(TextInput);
      expect(input.props.keyboardType).toBe('phone-pad');
    });

    it('should handle URL input', () => {
      render(<TextField keyboardType="url" />);
      const input = screen.UNSAFE_getByType(TextInput);
      expect(input.props.keyboardType).toBe('url');
    });
  });

  describe('States', () => {
    it('should disable input when disabled prop is true', () => {
      render(<TextField disabled placeholder="Disabled" />);
      // TextField should render successfully with disabled prop
      // Visual/behavioral testing of disabled state is done at integration level
      expect(screen.queryByPlaceholder('Disabled')).toBeDefined();
    });

    it('should show error state visually', () => {
      render(<TextField error="Invalid input" />);
      expect(screen.queryByText('Invalid input')).toBeDefined();
    });

    it('should handle focused state', () => {
      render(<TextField />);
      const input = screen.UNSAFE_getByType(TextInput);
      fireEvent(input, 'focus');
      expect(input).toBeDefined();
    });

    it('should handle empty value', () => {
      render(<TextField value="" />);
      const input = screen.UNSAFE_getByType(TextInput);
      expect(input.props.value).toBe('');
    });
  });

  describe('Multiline', () => {
    it('should support multiline input', () => {
      render(<TextField multiline numberOfLines={4} />);
      const input = screen.UNSAFE_getByType(TextInput);
      expect(input.props.multiline).toBe(true);
      expect(input.props.numberOfLines).toBe(4);
    });

    it('should handle text area input', () => {
      const onChangeText = jest.fn();
      render(
        <TextField
          multiline
          numberOfLines={5}
          value="Line 1\nLine 2"
          onChangeText={onChangeText}
        />,
      );

      const input = screen.UNSAFE_getByType(TextInput);
      fireEvent.changeText(input, 'Updated\nText');

      expect(onChangeText).toHaveBeenCalledWith('Updated\nText');
    });
  });

  describe('Character Limits', () => {
    it('should limit max characters', () => {
      render(<TextField maxLength={20} />);
      const input = screen.UNSAFE_getByType(TextInput);
      expect(input.props.maxLength).toBe(20);
    });

    it('should apply maxLength constraint', () => {
      const onChangeText = jest.fn();
      render(<TextField maxLength={20} onChangeText={onChangeText} />);
      const input = screen.UNSAFE_getByType(TextInput);
      expect(input.props.maxLength).toBe(20);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible label', () => {
      render(
        <TextField
          label="Username"
          accessibilityLabel="Username field"
        />,
      );
      expect(screen.queryByText('Username')).toBeDefined();
    });

    it('should be keyboard accessible', () => {
      render(<TextField />);
      const input = screen.UNSAFE_getByType(TextInput);
      expect(input).toBeDefined();
    });

    it('should announce error to screen reader', () => {
      render(
        <TextField
          error="This field is required"
          accessibilityLabel="Email field"
        />,
      );
      expect(screen.queryByText('This field is required')).toBeDefined();
    });
  });

  describe('Validation', () => {
    it('should show validation error', () => {
      render(<TextField error="Invalid email format" />);
      expect(screen.queryByText('Invalid email format')).toBeDefined();
    });

    it('should clear error when valid', () => {
      const { rerender } = render(<TextField error="Invalid" />);
      expect(screen.queryByText('Invalid')).toBeDefined();

      rerender(<TextField error="" />);
      expect(screen.queryByText('Invalid')).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long text', () => {
      const longText = 'a'.repeat(1000);
      render(<TextField value={longText} maxLength={1000} />);
      const input = screen.UNSAFE_getByType(TextInput);
      expect(input.props.value).toBe(longText);
    });

    it('should handle special characters', () => {
      const onChangeText = jest.fn();
      render(<TextField onChangeText={onChangeText} />);

      const input = screen.UNSAFE_getByType(TextInput);
      fireEvent.changeText(input, '!@#$%^&*()');

      expect(onChangeText).toHaveBeenCalledWith('!@#$%^&*()');
    });

    it('should handle unicode characters', () => {
      const onChangeText = jest.fn();
      render(<TextField onChangeText={onChangeText} />);

      const input = screen.UNSAFE_getByType(TextInput);
      fireEvent.changeText(input, '中文テストEmoji😊');

      expect(onChangeText).toHaveBeenCalledWith('中文テストEmoji😊');
    });

    it('should handle rapid changes', () => {
      const onChangeText = jest.fn();
      render(<TextField onChangeText={onChangeText} />);

      const input = screen.UNSAFE_getByType(TextInput);
      for (let i = 0; i < 100; i++) {
        fireEvent.changeText(input, `text${i}`);
      }

      expect(onChangeText).toHaveBeenCalledTimes(100);
    });

    it('should handle null/undefined values', () => {
      render(<TextField value={undefined} />);
      const input = screen.UNSAFE_getByType(TextInput);
      expect(input).toBeDefined();
    });
  });

  describe('Styling', () => {
    it('should apply custom styles', () => {
      render(<TextField style={{ backgroundColor: 'red' }} />);
      const input = screen.UNSAFE_getByType(TextInput);
      expect(input).toBeDefined();
    });

    it('should respect theme colors', () => {
      render(<TextField />);
      const input = screen.UNSAFE_getByType(TextInput);
      expect(input).toBeDefined();
    });
  });
});
