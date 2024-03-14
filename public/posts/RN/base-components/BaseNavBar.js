import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { getStatusBarHeight } from "app/utils/index";
import HBImage from "../image/HBImage";
import { px2dp } from "../../utils/ScreenUtils";
import { Actions } from "react-native-router-flux";

const BaseNavBar = ({ children, title, shouldHideBack, backClicked }) => {
  return (
    // 状态+导航栏 容器
    <View style={styles.container}>
      {/* 导航栏 */}
      <View style={styles.navContainer}>
        {/* left 返回按钮 */}
        {shouldHideBack ? null : (
          <TouchableOpacity
            style={{ width: 36, zIndex: 1 }}
            onPress={() => {
              backClicked ? backClicked() : Actions.pop();
            }}
          >
            <HBImage
              source={require("app/img/navigationBar/icon-back-black.png")}
              style={{
                marginLeft: px2dp(12),
                width: 21,
                height: 21,
                marginTop: px2dp(1.5),
              }}
            />
          </TouchableOpacity>
        )}

        {/* 标题 */}
        {title && (
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
          </View>
        )}

        {/* 其它内容 e.g.右侧按钮 */}
        {children}
      </View>
    </View>
  );
};

export default BaseNavBar;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: getStatusBarHeight() + 44,
    backgroundColor: "#fff",
  },

  navContainer: {
    width: "100%",
    marginTop: getStatusBarHeight(),
    height: 44,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
  },
  titleContainer: {
    position: "absolute",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: px2dp(18),
    color: "#333",
    textAlignVertical: "center",
    lineHeight: 44,
  },
});
