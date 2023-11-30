import React, { useState, useEffect, useCallback, useRef } from "react";
const Pop = require("rn-global-modal");
import {
  View,
  TouchableOpacity,
  TextInput,
  Image,
  BackHandler,
  Platform,
  StyleSheet,
} from "react-native";
import { Keyboard } from "react-native";
import {
  screenWidth,
  screenHeight,
  px2dp,
  showToast,
} from "app/utils/ScreenUtils";
import * as indexUtil from "app/utils/index";

/**
 * 独立的键盘输入框弹窗，任意位置可调用
 * todo: 将 rn-global-modal 换为 toast实现方式（react-native-root-siblings）。rn-global-modal 黑盒，有多种非预期bug，以致于键盘连动各种问题
 */
export default class TextInputAlert {
  /**
   * 展示弹窗
   * @param {String} text 已有文字
   * @param {String} maxLength 最长字数
   * @param {Function} onChange - (string)=>{} 输入变化回调
   * @param {Function} onCompleted - (string)=>{} 输入完成/发送回调
   */
  static show = ({ text, maxLength, onChange = () => {}, onCompleted }) => {
    console.log("popShow:::::::", text);
    Pop.show(
      <TextInputView
        text={text}
        maxLength={maxLength}
        onChange={(res) => {
          console.log("onChange:::");
          onChange?.(res);
        }}
        onClose={() => {
          this.hide();
        }}
        onCompleted={onCompleted}
      />,
      {
        animationType: "fade", //'slide-up',
        maskClosable: false,
        onMaskClose: () => {
          console.log(">>>:::>>> onMaskClose");
        },
        maskStyle: {
          opacity: 0,
        },
      }
    );
  };

  static hide = () => {
    Pop.hide();
  };
}

/** 输入框（全屏背景容器 + 输入框 + 发送按钮） */
const TextInputView = (props) => {
  const { text, maxLength, onChange, onClose, onCompleted } = props;

  const { keyboardHeight } = useKeyboard({
    keyboardDidHide: onClose,
  });

  const [barShouldShow, setBarShouldShow] = useState(false);
  const inputWrapperRef = useRef(null);
  const [inputContainerBottom, setInputContainerBottom] = useState(0);

  const [inputText, setInputText] = useState(text);
  const textInputRef = useRef(null);

  const backListenerRef = useRef(null);
  useEffect(() => {
    setTimeout(() => {
      textInputRef?.current?.focus();
    }, 200);
    addListener();
    return () => {
      removeListener();
    };
  }, []);
  const addListener = () => {
    backListenerRef.current = BackHandler.addEventListener(
      "hardwareBackPress",
      _handleBack
    );
  };
  const removeListener = () => {
    backListenerRef.current && backListenerRef.current.remove();
  };
  const _handleBack = () => {
    console.log("back::::");
    onClose?.();
    return true;
  };

  const onInputTextChange = (event) => {
    console.log("onInputTextChange:::", event.nativeEvent.text);
    let text_ = event.nativeEvent.text?.replace(/\n?$/, "");

    if (
      maxLength > 0 &&
      text_?.length > maxLength &&
      text_?.length > inputText?.length
    ) {
      showToast(`最多输入${maxLength}个字`);
      return;
    }

    setInputText(text_);
    onChange?.(text_);
  };

  const onClickClose = useCallback(() => {
    console.log("onClickClose:::");
    onClose?.();
    textInputRef?.current?.blur();
  }, [onClose]);

  const getInputWrapperPositionThenFix = (keyboardHeight_) => {
    if (inputWrapperRef.current) {
      // TextInputView容器 会随着键盘连动，然而连动的偏移，并不等于键盘高度，会有较大的差距
      inputWrapperRef.current.measure((fx, fy, width, height, px, py) => {
        // console.log("Y轴位置:", py); // 组件左上角的Y坐标
        // console.log("高度:", height); // 组件高度
        if (keyboardHeight_ > 0) {
          let res =
            keyboardHeight_ -
            (screenHeight - py - height) +
            (Platform.OS == "android" ? indexUtil.getStatusBarHeight() : 0);
          //TextInputView容器实际开始位置，是在状态栏下面，measure的dy是0而不是状态栏高度。也就是TextInputView容器整体相对屏幕 向下偏移了状态栏高度
          //barContainerHeight(即screenHeight)，是不包含状态栏的高度的, 看实际效果 正好是(屏幕高度-状态栏高度)

          // console.log("keyboardHeight_:", keyboardHeight_);
          // console.log("fix res:", res);
          // console.log("shouldShow:", res < keyboardHeight);
          setBarShouldShow(res < keyboardHeight); //避免 唤起键盘时，bar从过高的位置 闪跳到键盘上方，常见 res值为258时发生闪跳
          if (Math.abs(res) > 2) {
            setInputContainerBottom(Math.max(0, res)); //防止在 -127.33334223429358 和 258.0000012715658 循环设置，不断闪跳
          }
        }
      });
    }
  };

  useEffect(() => {
    keyboardHeight > 0 && getInputWrapperPositionThenFix(keyboardHeight);
  }, [keyboardHeight]);

  // console.log("screenHeight:", screenHeight);

  return (
    // TextInputView容器
    <View
      style={{
        height: screenHeight,
        width: screenWidth(),
        // borderColor: "red",
        // borderWidth: 4, //此时就能看到TextInputView容器的上下边界位置
      }}
    >
      {/* 背景蒙层 可点击dismiss */}
      <TouchableOpacity
        style={{
          flex: 1,
          // backgroundColor: "rgba(16, 20, 23, 0.20)",
        }}
        activeOpacity={1}
        onPress={onClickClose}
      />

      {/* 输入栏，键盘之上 */}
      <View
        ref={inputWrapperRef}
        style={[
          styles.inputBar,
          {
            bottom:
              Platform.OS == "android" ? inputContainerBottom : keyboardHeight,
            opacity: barShouldShow ? 1 : 0,
          },
        ]}
        onLayout={(e) => {
          //console.log("inputWrapperRef layout:", e.nativeEvent.layout);
          getInputWrapperPositionThenFix(keyboardHeight);
        }}
      >
        <View style={styles.inputBorder}>
          <TextInput
            ref={textInputRef}
            style={styles.inputText}
            placeholder={"请输入"}
            placeholderTextColor={"#B3B1B1"}
            value={inputText}
            onChange={onInputTextChange}
            multiline={true}
            returnKeyType={"done"}
            onSubmitEditing={onCompleted}
          />
        </View>
        <TouchableOpacity style={styles.sendTouchSty} onPress={onCompleted}>
          <Image
            style={{ width: px2dp(15), height: px2dp(15) }}
            source={require("app/img/plane_blue.png")}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputBar: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: "white",
    width: "100%",
    position: "absolute",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputBorder: {
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 10,
    flex: 1,
  },
  inputText: {
    lineHeight: px2dp(21),
    fontSize: px2dp(15),
    padding: 0,
  },
  sendTouchSty: {
    marginTop: 5,
    height: px2dp(32),
    width: px2dp(40),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    marginLeft: px2dp(15),
    backgroundColor: "#F5F5F5",
  },
});

function useKeyboard(props) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const handleKeyboardDidShow = (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    };
    const handleKeyboardDidHide = (e) => {
      props.keyboardDidHide?.();
      setKeyboardHeight(0);
    };

    let keyboardDidShow, keyboardDidHide, keyboardWillShow, keyboardWillHide;
    if (Platform.OS === "android") {
      keyboardDidShow = Keyboard.addListener(
        "keyboardDidShow",
        handleKeyboardDidShow
      );
      keyboardDidHide = Keyboard.addListener(
        "keyboardDidHide",
        handleKeyboardDidHide
      );
    } else {
      keyboardWillShow = Keyboard.addListener(
        "keyboardWillShow",
        handleKeyboardDidShow
      );
      keyboardWillHide = Keyboard.addListener(
        "keyboardWillHide",
        handleKeyboardDidHide
      );
    }
    return () => {
      if (Platform.OS === "android") {
        keyboardDidShow.remove();
        keyboardDidHide.remove();
      } else {
        keyboardWillShow.remove();
        keyboardWillHide.remove();
      }
    };
  }, [props.keyboardDidHide]);

  return {
    keyboardHeight,
  };
}
