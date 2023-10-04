import React from 'react';
import { Animated, TouchableWithoutFeedback, View } from 'react-native';

const AnimatedTouch = Animated.createAnimatedComponent(
  TouchableWithoutFeedback,
);

class AnimatedHideView extends React.PureComponent {
  static defaultProps = {
    duration: 700,
    animate: true,
    unmountOnHide: false,
    style: {},
  };

  constructor(props) {
    super(props);
    this.opacity = new Animated.Value(props.visible ? 1 : 0);
  }

  UNSAFE_componentWillUpdate(nextProps) {
    if (this.props.visible !== nextProps.visible) {
      this.animate();
    }
  }

  animate = () => {
    const { animate, duration, visible } = this.props;
    Animated.timing(this.opacity, {
      toValue: visible ? 0 : 1,
      duration: animate ? duration : 0,
      useNativeDriver: true,
    }).start();
  };

  render() {
    const { unmountOnHide, visible, style, children, ...otherProps } =
      this.props;

    const renderStyle = {
      opacity: this.opacity,
      zIndex: visible ? 1 : 0,
    };

    if (unmountOnHide && !visible) {
      return <View />;
    }

    return (
      <AnimatedTouch style={[renderStyle, style]} {...otherProps}>
        {children}
      </AnimatedTouch>
    );
  }
}

export default AnimatedHideView;
