import React from 'react';

export interface StackItemProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  alignSelf?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  flex?: React.CSSProperties['flex'];
  grow?: React.CSSProperties['flexGrow'];
  shrink?: React.CSSProperties['flexShrink'];
  basis?: React.CSSProperties['flexBasis'];
  order?: React.CSSProperties['order'];
}

const StackItem = React.forwardRef<HTMLElement, StackItemProps>(
  ({
    as: Component = 'div', style, alignSelf, flex, grow, shrink, basis, order, ...rest
  }, ref) => {
    const itemStyle: React.CSSProperties = {
      alignSelf,
      order,
      ...(flex !== undefined ? { flex } : { flexGrow: grow, flexShrink: shrink, flexBasis: basis }),
      ...style,
    };

    return <Component ref={ref} style={itemStyle} {...rest} />;
  },
);

StackItem.displayName = 'Stack.Item';

export default StackItem;
