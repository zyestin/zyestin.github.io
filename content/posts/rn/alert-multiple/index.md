---
title: "实现 差不多理想的极简RN弹窗"
date: 2023-11-01T12:00:11+08:00
draft: false
categories: [react-native]
tags: [best-practice, react-native]
---


# Q: 代码调用一个弹窗的极简方式是怎样的？

A: 这样子👉🏻 ***`XxModuleAlert.show({..})`***


> 为了这个极简用法的目标，我曾经 使用`rn-global-modal`封装过[TextInputAlert](../textinput-alert/)，但依然有些问题或难用点，比如遮挡了`Toast`、更改mask颜色要改源码、布局上有些非正常的地方
>
>因为不希望弹窗遮挡`Toast`，于是研究了[`react-native-root-toast`](https://github.com/magicismight/react-native-root-toast)，用的`react-native-root-siblings`，从而找到了封装理想弹窗的更快的方式
>
>于是，基于`react-native-root-siblings 5.0.1`，造了一个 `AlertManager`


# ***Why*** need `AlertManager`

相信大家使用过RN官方`Modal`的，都知道，iOS弹窗无法弹两个，使用起来不满足`高内聚低耦合`，难受。。。

### RN官方Modal
- 缺点：耦合过多！须visible属性，多1个import useState，多1行代码setVisble声明，弹窗组件须嵌入容器组件

### rn-global-modal
- 优点：函数式调起弹窗，任意处可调用
- 缺点：iOS 不支持同时多层弹窗；toast的层级低于它 导致看不到/看不清


# ***What*** `AlertManager` provide
- 封装者：封装出高度解耦的弹窗。
- 使用方：使用极简！

### 优势
- vs Modal：去掉visible
- vs rn-global-modal: 支持多层弹窗, TextInput弹窗对键盘支持更好？？


# ***How*** to use `AlertManager`

- 使用方：
```
XxModuleAlert.show({...});
XxModuleAlert.hide();
```

- 封装方: 
```
class XxModuleAlert {
  static show() {
    AlertManager.show(<XxModuleView />, {
      key: XxModuleView.name,
    });
  }
  static hide() {
    AlertManager.hide(XxModuleView.name);
  }
}

export XxModuleAlert

const XxModuleView = () => {
	...
	return (...)
}
```


# 源码

```
import React from "react";
import { Dimensions, TouchableOpacity, View } from "react-native";
import RootSiblingsManager from "react-native-root-siblings";

const { width, height } = Dimensions.get("window");

/**
 * 弹窗管理类
 * - 支持同时弹出多个弹窗 （Modal、rn-global-modal 不支持）
 * - 不会遮挡Toast（Modal、rn-global-modal 会遮挡Toast）
 */
class AlertManger {
  static _alertNodes = {}; // { key1: { rootNode: <A/>, onClose: () => {} }, key2: { rootNode: <B/>, onClose: () => {} }

  /**
   * 展示弹窗
   * @param {*} modalView             弹窗内所要展示的内容组件
   * @param {*} options.key                **必传** 弹窗唯一标识
   * @param {*} options.maskStyle          蒙层样式 默认值：{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }
   * @param {*} options.maskTouchClosable  弹窗蒙层是否可点击关闭
   * @param {*} options.closedCallback     弹窗关闭的回调
   * @param {*} options.animationType      [todo] 弹窗动画类型: none | fade | slide-up
   */
  static show(modalView, options) {
    const { key, maskTouchClosable, closedCallback, maskStyle } = options;

    let rootNode;
    const onClose = () => {
      rootNode?.destroy();
      rootNode = null;
      closedCallback?.();
    };
    rootNode = new RootSiblingsManager(
      (
        <View
          style={[
            {
              position: "absolute",
              width: width,
              height: height,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.5)",
            },
            maskStyle,
          ]}
        >
          <TouchableOpacity
            style={{
              position: "absolute",
              width: width,
              height: height,
            }}
            activeOpacity={1}
            onPress={(e) => {
              maskTouchClosable && this.hide(key);
            }}
          />
          {modalView}
        </View>
      )
    );
    this._alertNodes[key] = { rootNode, onClose };

    console.log("this._alertNodes:::", this._alertNodes);
  }

  static hide(key) {
    console.log(
      "this._alertNodes?.[key]?.onClose::",
      this._alertNodes?.[key]?.onClose
    );
    this._alertNodes?.[key]?.onClose?.();
    delete this._alertNodes[key];
  }
}

export default AlertManger;

/* ----------------------- Usage ---------------------- */
/*
 * 弹窗开发者 这样封装自己的弹窗
	```
	import AlertManager from "app/components/dialog/AlertManager.js";
	class BbModuleAlert {
	  static show() {
	    AlertManager.show(<BModuleView />, {
	      key: BModuleView.name,
	      maskTouchClosable: true,
	      closedCallback: () => {
	        console.log("BModuleView closedCallback");
	      },
	    });
	  }
	  static hide() {
	    AlertManager.hide(BModuleView.name);
	  }
	}

	export default BbModuleAlert;

	const BModuleView = () => {
	  return (
	    ...
	  )
	}
	```
*/

/*
 * 弹窗调用者 这样调用弹窗
	```
	import BbModuleAlert from "./BbModuleAlert";
	BbModuleAlert.show();
	BbModuleAlert.hide();
	```
*/

```


## todo
- 如何提供 页面级别的弹窗 `showInComp(comp)`
> **需求**：
> 某个弹窗，是当前A页面的子视图，若点击该弹窗种的按钮，跳转到下一个B页面时，该弹窗继续展示在A页面，B页面在最上层展示(是盖住该弹窗的)

- 像 取消&确认 弹窗，可以基于这个重做一遍了


