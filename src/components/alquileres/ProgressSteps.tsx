import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../../theme';

interface Step {
  number: number;
  label: string;
}

interface Props {
  currentStep: number;
  steps: Step[];
}

export default function ProgressSteps({ currentStep, steps }: Props) {
  return (
    <View style={styles.container}>
      {steps.map((step, index) => (
        <View key={step.number} style={styles.stepContainer}>
          <View style={styles.stepCircleContainer}>
            {index > 0 && (
              <View style={[
                styles.line,
                currentStep > step.number && styles.lineCompleted,
              ]} />
            )}
            <View style={[
              styles.circle,
              currentStep >= step.number && styles.circleActive,
              currentStep > step.number && styles.circleCompleted,
            ]}>
              <Text style={[
                styles.circleText,
                currentStep >= step.number && styles.circleTextActive,
                currentStep > step.number && styles.circleTextCompleted,
              ]}>
                {currentStep > step.number ? '✓' : step.number}
              </Text>
            </View>
          </View>
          <Text style={[
            styles.label,
            currentStep === step.number && styles.labelActive,
            currentStep > step.number && styles.labelDone,
          ]}>
            {step.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection:       'row',
    justifyContent:      'space-between',
    paddingHorizontal:   20,
    paddingVertical:     20,
    backgroundColor:     colors.surface,
    borderBottomWidth:   1,
    borderBottomColor:   colors.border,
  },
  stepContainer: {
    flex:       1,
    alignItems: 'center',
  },
  stepCircleContainer: {
    position:   'relative',
    width:      '100%',
    alignItems: 'center',
  },
  line: {
    position:        'absolute',
    top:             17,
    left:            0,
    right:           '50%',
    height:          2,
    backgroundColor: colors.border,
  },
  lineCompleted: {
    backgroundColor: colors.red,
  },
  circle: {
    width:           36,
    height:          36,
    borderRadius:    18,
    backgroundColor: colors.surface2,
    borderWidth:     2,
    borderColor:     colors.glassBorder,
    justifyContent:  'center',
    alignItems:      'center',
    zIndex:          1,
  },
  circleActive: {
    borderColor:     colors.red,
    backgroundColor: colors.surface,
  },
  circleCompleted: {
    backgroundColor: colors.red,
    borderColor:     colors.red,
  },
  circleText: {
    ...typography.bodySemiBold,
    fontSize: 14,
    color:    colors.muted,
  },
  circleTextActive: {
    color: colors.red,
  },
  circleTextCompleted: {
    color: colors.text,
  },
  label: {
    ...typography.body,
    fontSize:   11,
    color:      colors.muted,
    marginTop:  8,
    textAlign:  'center',
  },
  labelActive: {
    ...typography.bodySemiBold,
    color: colors.text,
  },
  labelDone: {
    color: colors.red,
  },
});
