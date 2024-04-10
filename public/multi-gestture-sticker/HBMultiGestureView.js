import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  PanResponder,
  Animated,
  UIManager,
  findNodeHandle,
} from "react-native";
import {
  calculateDegreeOfTouches,
  calculateScaleOfTouches,
  calculateScaleWhenDragging,
  calculateDegree,
} from "./calculator";

/** 拖拽 缩放 旋转 动画工具组件
 * @param {*} style
 * @param {*} transformConfig { translateX, translateY, scale, rotate }
 * @param {*} onTransformChanged  ({ translateX, translateY, scale, rotate }) => {}
 * @param {*} children   内容 + 四角的icon
 * @param {*} rotateScaleTargetRef 指定 一个（eg.右下角) 控制旋转、放大的 icon的target值
 * @returns
 */

const HBMultiGestureView = (props) => {
  const {
    style,
    transformConfig,
    onTransformChanged,
    onTransformEnd,
    children,
    rotateScaleTargetRef,
    enable = false,
  } = props;

  const {
    translateX: defaultTranslateX,
    translateY: defaultTranslateY,
    scale: defaultScale,
    rotate: defaultRotate,
  } = transformConfig;

  const isMoveRef = useRef(false);

  //防止闭包引用旧函数
  const moveEndRef = useRef(() => {});
  moveEndRef.current = onTransformEnd;

  const enableRef = useRef(false);
  enableRef.current = enable;

  const [pan] = useState(
    new Animated.ValueXY({ x: defaultTranslateX, y: defaultTranslateY })
  );
  const translateRef = useRef({ x: defaultTranslateX, y: defaultTranslateY });

  const scale = useRef(new Animated.Value(defaultScale || 1)).current;
  const scaleRef = useRef(defaultScale || 1);

  const rotate = useRef(new Animated.Value(defaultRotate)).current;
  const rotateRef = useRef(defaultRotate);

  const isMultiTouchingNowRef = useRef(false);
  const initialTouches = useRef([]);

  useEffect(() => {
    translateRef.current = { x: defaultTranslateX, y: defaultTranslateY };
    pan.setValue(translateRef.current);
    scaleRef.current = defaultScale || 1;
    scale.setValue(scaleRef.current);
    rotateRef.current = defaultRotate || 0;
    rotate.setValue(rotateRef.current);

    transformConfig && onTransformChanged(transformConfig);
  }, [transformConfig]);

  const gestureContainerTransformStyle = {
    transform: [
      { translateX: pan.x },
      { translateY: pan.y },
      { scale: scale },
      { rotate: rotate },
    ],
  };

  const isMoveOnCorner = useRef(false);
  const containerRef = useRef(null);

  const centerPoint = useRef({ x: 0, y: 0 });
  // 记录右下角icon手势开始时的触摸点
  const rightBottomOriginalPoint = useRef({ x: 0, y: 0 });

  // 视图显示记录的中心点位置 用于肉眼观测中心点计算的是否正确
  // const [testCenterPoint, setTestCenterPoint] = useState(centerPoint.current);

  const measureCenterPoint = () => {
    UIManager.measure(
      findNodeHandle(containerRef.current),
      (x, y, width, height, pageX, pageY) => {
        centerPoint.current = {
          x: pageX + width / 2,
          y: pageY + height / 2,
        };
        console.log("measureCenterPoint:", centerPoint.current);
      }
    );
  };

  const onMoveStart = (eNativeEvent, gestureState) => {
    console.log("onMoveStart::", eNativeEvent);
    const { pageX: fingerX, pageY: fingerY, target, touches } = eNativeEvent;

    initialTouches.current = touches;
    if (touches.length > 1) {
      isMultiTouchingNowRef.current = true;
    } else {
      isMultiTouchingNowRef.current = false;
      isMoveOnCorner.current = target === rotateScaleTargetRef.current;
    }

    //确保本次操作 是在上次操作的基础之上，从而避免每次手势操作开始时 位置突变
    if (isMoveOnCorner.current || isMultiTouchingNowRef.current) {
      rotate.setValue(rotate._value);
    } else {
      pan.setOffset({
        x: pan.x._value,
        y: pan.y._value,
      });
    }
    rightBottomOriginalPoint.current = {
      x: fingerX,
      y: fingerY,
    };
  };

  const onMove = (e, gestureState) => {
    console.log("onMove::", e, "\n", gestureState);
    isMoveRef.current = true;

    if (isMoveOnCorner.current) {
      // console.log("------放大缩小");
      _cornerDrag(gestureState);
    } else if (isMultiTouchingNowRef.current) {
      // console.log("------ 双指缩放旋转");
      _pinch(e);
    } else {
      // console.log("------ 移动");
      _move(gestureState);
    }
  };

  const onMoveEnd = (e, gesture) => {
    //fix: 部分机型仅走moveStart和moveEnd，不走move时，导致位置突变
    if (!isMoveRef.current) {
      isMoveOnCorner.current = false;
      //若没走onMove就走这里了，属于多余的一次手势操作，将onMoveStart里多余的offset操作还原
      pan.setOffset({ x: 0, y: 0 });
      pan.flattenOffset();
      return;
    }
    isMoveRef.current = false;
    console.log("scale._value::", scale._value);
    scaleRef.current = scale._value;
    console.log("rotate._value", rotate._value);
    rotateRef.current = rotate._value;

    if (!isMoveOnCorner.current && !isMultiTouchingNowRef.current) {
      translateRef.current = {
        x: translateRef.current.x + pan.x._value,
        y: translateRef.current.y + pan.y._value,
      };
      centerPoint.current = {
        x: centerPoint.current.x + gesture.dx,
        y: centerPoint.current.y + gesture.dy,
      };
      console.log("centerPoint.current", centerPoint.current);
    }

    const data = {
      translateX: translateRef.current.x,
      translateY: translateRef.current.y,
      scale: scaleRef.current,
      rotate: rotateRef.current,
    };

    // onTransformEnd?.(data);
    moveEndRef.current?.(data);

    isMoveOnCorner.current = false;
    isMultiTouchingNowRef.current = false;
    //配合解决 再次手势开始时的位置突变
    pan.flattenOffset();
  };

  console.log("props.enable render", props.enable);

  const _cornerDrag = (gestureState) => {
    const { moveX, moveY } = gestureState;
    let rightBottomCurrentPoint = {
      x: moveX,
      y: moveY,
    };
    let scaleValue = calculateScaleWhenDragging(
      centerPoint.current,
      rightBottomOriginalPoint.current,
      rightBottomCurrentPoint
    );
    let scaleResult = scaleRef.current * scaleValue;
    scale.setValue(scaleResult);

    //处理旋转角度
    let degree = calculateDegree(
      centerPoint.current,
      rightBottomOriginalPoint.current,
      rightBottomCurrentPoint
    );
    // console.log("degree = ", degree);
    let degreeResult = degree + rotateRef.current;
    rotate.setValue(degreeResult);

    onTransformChanged &&
      onTransformChanged({
        translateX: pan.x._value,
        translateY: pan.y._value,
        scale: scaleResult,
        rotate: degreeResult,
      });
  };

  const _pinch = (event) => {
    const { touches: currentTouches } = event.nativeEvent;
    if (currentTouches.length < 2) {
      console.log("currentTouches.length < 2");
      return;
    }
    let scaleValue = calculateScaleOfTouches(
      initialTouches.current,
      currentTouches
    );
    let scaleResult = scaleRef.current * scaleValue;
    scale.setValue(scaleResult);
    console.log("scaleResult = ", scaleResult);

    let degree = calculateDegreeOfTouches(
      initialTouches.current,
      currentTouches
    );
    let degreeResult = degree + rotateRef.current;
    rotate.setValue(degreeResult);
    console.log("degreeResult = ", degreeResult);

    onTransformChanged &&
      onTransformChanged({
        translateX: pan.x._value,
        translateY: pan.y._value,
        scale: scaleResult,
        rotate: degreeResult,
      });
  };

  const _move = (gestureState) => {
    const { dx, dy } = gestureState;
    pan.setValue({ x: dx, y: dy });
    onTransformChanged &&
      onTransformChanged({
        translateX: translateRef.current.x + dx,
        translateY: translateRef.current.y + dy,
        scale: scaleRef.current,
        rotate: rotateRef.current,
      });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetResponderCapture: () => enableRef.current, //为解决闭包只捕获一次初值， 所以这里传ref
      onMoveShouldSetPanResponderCapture: () => enableRef.current,
      onPanResponderGrant: (e, gestureState) => {
        let frameInfo = e.nativeEvent;
        onMoveStart(frameInfo, gestureState);
      },
      onPanResponderMove: (e, gestureState) => {
        onMove(e, gestureState);
      },
      onPanResponderRelease: (e, gestureState) => {
        onMoveEnd(e, gestureState);
      },
    })
  );

  return (
    // <>
    // 	<View
    // 		style={[
    // 			styles.centerDot,
    // 			{
    // 				zIndex: 100,
    // 				left: testCenterPoint.x - styles.centerDot.width / 2,
    // 				top: testCenterPoint.y - styles.centerDot.height / 2,
    // 			},
    // 		]}
    // 	/>
    <Animated.View
      ref={containerRef}
      onLayout={() => {
        //frame发生变化, 会走该回调 重新计算中心点
        measureCenterPoint();
      }}
      style={[
        styles.container,
        ...(Array.isArray(style) ? style : [style]),
        gestureContainerTransformStyle,
      ]}
      {...panResponder.current.panHandlers}
    >
      {/* 内容 */}
      {children}
    </Animated.View>
    // </>
  );
};

export default HBMultiGestureView;

const styles = StyleSheet.create({
  // centerDot: {
  //   position: "absolute",
  //   width: 10,
  //   height: 10,
  //   backgroundColor: "blue",
  // },

  container: {
    position: "absolute",
  },
});
