import React from "react";
import HBImage from "app/components/image/HBImage";
import { TouchableOpacity, View } from "react-native";
import { px2dp } from "app/utils/ScreenUtils";
import { Actions } from "react-native-router-flux";
import * as indexUtil from "app/utils/index";

/**
 * 返回按钮
 * @param {*} props  onPress,
 * @returns
 */
const LeftUpBackButton = ({ onPress, iconType }) => {
  return (
    <TouchableOpacity
      style={{
        zIndex: 999,
        position: "absolute",
        top: indexUtil.getStatusBarHeight(),
        width: px2dp(50),
        height: 44,
        justifyContent: "center",
        left: 0,
      }}
      onPress={() => {
        if (onPress) {
          onPress();
        } else {
          Actions.pop();
        }
      }}
    >
      <HBImage
        source={
          iconType == "white"
            ? require("app/img/Status_bar_return.png")
            : require("app/img/navigationBar/icon-back-black.png")
        }
        style={{
          marginLeft: px2dp(12),
          width: px2dp(11),
          height: px2dp(19),
          marginTop: px2dp(1.5),
        }}
      />
    </TouchableOpacity>
  );
};

export default LeftUpBackButton;
