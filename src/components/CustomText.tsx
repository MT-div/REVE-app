import { Text, TextProps, StyleSheet } from 'react-native';

interface Props extends TextProps {
  bold?: boolean;
}

export default function CustomText({ style, bold, ...props }: Props) {
  return (
    <Text
      {...props}
      style={[
        styles.base,
        bold && styles.bold,
        style
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: 'NotoKufiArabic-VariableFont_wght',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  bold: {
    fontFamily: 'NotoKufiArabic-Blod'
  }
});