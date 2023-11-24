import {
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import HBMultiGestureView from "./HBMultiGestureView";

export const ICON_POSITION = {
  LEFT_TOP: 0,
  RIGHT_TOP: 1,
  LEFT_BOTTOM: 2,
  RIGHT_BOTTOM: 3,
};

const defaultTransformConfig = {
  translateX: 0,
  translateY: 0,
  scale: 1,
  rotate: 0,
};

/** 四个角落携带工具按钮的手势视图 （基于「拖拽、缩放、旋转 动画工具组件」封装）
 * @param {*} style
 * @param {Object} transformConfig { translateX, translateY, scale, rotate }
 * @param {Function} onTransformChanged  ({ translateX, translateY, scale, rotate }) => {}
 * @param {*} children   内容
 * @param {Object} iconsSource   icon配置 { ICON_POSITION.LEFT_TOP: require("app/img/qq.png"), ... }
 * @param {Function} iconClicked   icon点击回调 ( ICON_POSITION.LEFT_TOP ) => {}
 * @param {Number} iconW   icon宽高
 * @param {Boolean} active   是否活跃状态， 活跃状态下才会显示icon、边框
 * @returns
 */

const screenW = Dimensions.get("window").width;

const CornerToolGestureView = ({
  style,
  transformConfig,
  onTransformEnd,
  children,
  iconsSource,
  iconClicked,
  iconW = 20,
  active = true,
  onClick,
  canvasW = screenW,
}) => {
  const tfConfig = useRef(
    screenAdapt(transformConfig || defaultTransformConfig, canvasW)
  ).current;

  console.log("transformConfig.....", transformConfig);

  const iconWidth = useRef(new Animated.Value(iconW / tfConfig?.scale)).current;
  const iconHeight = useRef(new Animated.Value(iconW / tfConfig?.scale))
    .current;
  const borderWidthScale = useRef(new Animated.Value(tfConfig?.scale || 1))
    .current;

  const rotateY = useRef(new Animated.Value(0)).current;

  const padding = useRef(new Animated.Value(iconW / 2 / (tfConfig?.scale || 1)))
    .current;

  const _onTransformChanged = (transform) => {
    const { translateX, translateY, scale, rotate } = transform;

    // console.log("onTransformChanged: ", translateX, translateY, scale, rotate);
    iconWidth.setValue(iconW / scale);
    iconHeight.setValue(iconW / scale);
    borderWidthScale.setValue(Math.min(6, scale));

    //纠正内容的padding 使与icon的距离保持不变
    padding.setValue(iconW / 2 / scale);

    // console.log("....transformConfig", transformConfig, transform, rotateY);
    const data = {
      ...transform,
      translateX: translateX / canvasW, // 除以了当前屏幕宽度，方便更换设备后的屏幕适配
      translateY: translateY / canvasW,
      // 拿不到最新的 transformConfig 所以无法解构使用
      mirror: rotateY._value === Math.PI ? true : false,
    };
    // console.log("...._onTransformChanged", data);
    // onTransformChanged?.(data);
  };

  const _onTransformEnd = (transform) => {
    const { translateX, translateY } = transform;
    const data = {
      ...transform,
      translateX: translateX / canvasW, // 除以了当前屏幕宽度，方便更换设备后的屏幕适配
      translateY: translateY / canvasW,
      // 拿不到最新的 transformConfig 所以无法解构使用
      mirror: rotateY._value === Math.PI ? true : false,
    };
    console.log("...._onTransformEnd", data);
    onTransformEnd?.(data);
  };

  const rotateTargetRef = useRef(-1);
  const iconHandleLayout = (e, viewSource) => {
    console.log("iconHandleLayout viewSource", viewSource, e.target);
    rotateTargetRef.current = e.target;
  };

  useEffect(() => {
    rotateY.setValue(transformConfig.mirror ? Math.PI : 0);
  }, [transformConfig.mirror]);

  const renderCornerIcons = (iconsSource) => {
    const list = Object.keys(iconsSource);
    return list.map((position) => {
      const iconStyle = styleConfig[position];
      const source = iconsSource[position];
      return (
        <Animated.View
          key={position}
          style={[
            iconStyle,
            { width: iconWidth },
            { height: iconHeight },
            { opacity: active ? 1 : 0 },
          ]}
          onTouchEnd={(e) => {
            console.log("iconClickediconClicked", e);
            iconClicked?.(position);
          }}
        >
          <Image
            source={source}
            style={{ width: "100%", height: "100%" }}
            onLayout={(e) => {
              if (position == ICON_POSITION.RIGHT_BOTTOM) {
                iconHandleLayout(e, "Image");
              }
            }}
          />
        </Animated.View>
      );
    });
  };

  return (
    <HBMultiGestureView
      style={[style, { padding: padding }]}
      transformConfig={tfConfig}
      onTransformChanged={_onTransformChanged}
      onTransformEnd={_onTransformEnd}
      rotateScaleTargetRef={rotateTargetRef}
      enable={active}
    >
      {/* 内容 */}
      <Animated.View
        style={{
          borderWidth: Animated.divide(1, borderWidthScale),
          borderColor: active ? "#fff" : "rgba(0,0,0,0)",
          overflow: "hidden",
          transform: [{ rotateY }],
        }}
        onTouchEnd={onClick}
      >
        {children}
      </Animated.View>
      {/* 角落的icon */}
      {iconsSource && renderCornerIcons(iconsSource)}
    </HBMultiGestureView>
  );
};

function screenAdapt(_data, canvasW) {
  // 解决只读问题
  const data = { ..._data };
  console.log("screenAdapt:", data);
  if (data.translateX == undefined || data.translateY == undefined) {
    return data;
  }
  data.translateX = data.translateX * canvasW;
  data.translateY = data.translateY * canvasW;
  return data;
}

export default CornerToolGestureView;

const iconStyle = StyleSheet.create({
  common: {
    position: "absolute",
  },
});

const styles = StyleSheet.create({
  leftTopIcon: {
    left: 0,
    top: 0,
    ...iconStyle.common,
  },
  leftBottomIcon: {
    left: 0,
    bottom: 0,
    ...iconStyle.common,
  },
  rightTopIcon: {
    right: 0,
    top: 0,
    ...iconStyle.common,
  },
  rightBottomIcon: {
    right: 0,
    bottom: 0,
    ...iconStyle.common,
  },
});

const styleConfig = {
  [ICON_POSITION.LEFT_TOP]: styles.leftTopIcon,
  [ICON_POSITION.LEFT_BOTTOM]: styles.leftBottomIcon,
  [ICON_POSITION.RIGHT_TOP]: styles.rightTopIcon,
  [ICON_POSITION.RIGHT_BOTTOM]: styles.rightBottomIcon,
};
