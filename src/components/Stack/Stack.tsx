import React from 'react';
import StackItem from './StackItem';

export interface StackProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  alignSelf?: React.CSSProperties['alignSelf'];
  justifyContent?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  /** Gap between children — passed directly to CSS `gap`. Accepts px number or any CSS string (e.g. "8px 16px") */
  spacing?: number | string;
  wrap?: boolean | 'wrap' | 'wrap-reverse';
  /** Element rendered between each child */
  divider?: React.ReactNode;
  /**
   * "wrap"  — non-StackItem children are automatically wrapped in a StackItem
   * "clone" — class/style are merged directly onto each child via cloneElement
   */
  childrenRenderMode?: 'wrap' | 'clone';
}

export interface StackComponent
  extends React.ForwardRefExoticComponent<StackProps & React.RefAttributes<HTMLElement>> {
  Item: typeof StackItem;
}

const Stack = React.forwardRef<HTMLElement, StackProps>(
  (
    {
      as: Component = 'div',
      direction = 'row',
      alignItems = 'center',
      alignSelf,
      justifyContent,
      spacing,
      wrap,
      divider,
      childrenRenderMode = 'wrap',
      style,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    let flexWrap: 'wrap' | 'wrap-reverse' | undefined;
    if (wrap === true) flexWrap = 'wrap';
    else if (typeof wrap === 'string') flexWrap = wrap;
    else flexWrap = undefined;
    const gap = typeof spacing === 'number' ? `${spacing}px` : spacing;

    const containerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: direction,
      alignItems,
      justifyContent,
      flexWrap,
      gap,
      alignSelf,
      ...style,
    };

    const validChildren = React.Children.toArray(children) as React.ReactElement<React.HTMLAttributes<HTMLElement>>[];
    const count = validChildren.length;

    const renderChild = (child: React.ReactElement<React.HTMLAttributes<HTMLElement>>, index: number) => {
      if (childrenRenderMode === 'clone') {
        return React.cloneElement(child, {
          key: index,
          style: { ...child.props.style },
        });
      }

      if (child.type === StackItem) {
        return React.cloneElement(child, { key: index });
      }

      return (
        <StackItem key={index}>
          {child}
        </StackItem>
      );
    };

    return (
      <Component ref={ref} className={className} style={containerStyle} {...rest}>
        {validChildren.map((child, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <React.Fragment key={index}>
            {renderChild(child, index)}
            {divider && index < count - 1 ? divider : null}
          </React.Fragment>
        ))}
      </Component>
    );
  },
) as StackComponent;

Stack.Item = StackItem;
Stack.displayName = 'Stack';

export default Stack;
