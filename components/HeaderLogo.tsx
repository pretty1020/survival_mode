import React from 'react';
import { View } from 'react-native';
import { BudgetSurvivorLogo } from './BudgetSurvivorLogo';

export function HeaderLogo() {
  return (
    <View style={{ marginLeft: 4 }}>
      <BudgetSurvivorLogo size={32} showGlow={false} />
    </View>
  );
}
