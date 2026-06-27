import React, { FC } from 'react';
import { COLOR } from '../../styles/tokens.ts';
import { Car as CarType } from '../../types/Car';
import { Icon } from '../Icon';

export type CarProps = CarType;

export const Car: FC<CarProps> = React.memo(({ color }: CarType) => (
  <div
    style={{
      width: 'var(--car-width)',
      height: 'var(--car-height)',
      background: COLOR.BG_BASE,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      userSelect: 'none',
      overflow: 'hidden',
    }}
  >
    <Icon name="car-top-view" style={{ fontSize: 'var(--car-height)' }} color={color} />
  </div>
));
