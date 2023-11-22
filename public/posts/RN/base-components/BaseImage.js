import React, { useEffect, useMemo, useRef, useState } from "react";
import { Image, View } from "react-native";
import FastImage from "react-native-fast-image";

// aliyun oss image format
// error image url: https://cdn.xxx.com/pic/illustrationstory/default/default_cover_720-1080.png?x-oss-process=image/resize,w_150/quality,q_85/format,webp
// normal image url: https://cdn.xxx.com/pic/illustrationstory/custom/scene/202310/2721/1698415166233-0yZkuCBu9I_960-960.png?x-oss-process=image/resize,w_150/quality,q_85/format,webp

/**
 * 图片组件
 * @param {require('xxx') | {uri: string}} errorSource 加载失败的图片
 */
export default React.memo((props) => {
  const {
    source,
    style,
    resizeMode,
    onLoad,
    errorSource,
    // todo: 加载中的图片
    // pendingSource, // loading状态的图片、加载失败的图片
    // pendingStyle, // loading状态的图片样式
  } = props;

  const { loadStatus, onLoadStart, onLoadEnd, onLoadError } = useWebImage({
    source,
  });
  // console.log("props.source: ", source?.uri);
  // console.log("loadStatus:", loadStatus);

  if (!source) {
    return null;
  }

  const _style = amendStyle(style);

  const isWebImage = useMemo(() => source?.uri?.startsWith("http"), [source]);
  console.log("isWebImage:", isWebImage);

  // const renderPending = () => {
  //   return pendingSource ? (
  //     <View style={{ position: "absolute" }}>
  //       <Image source={pendingSource} style={pendingStyle} />
  //     </View>
  //   ) : (
  //     <View
  //       style={[_style, { position: "absolute", backgroundColor: "#ccc" }]}
  //     />
  //   );
  // };

  console.log("_style:", _style);
  const renderError = () => {
    console.log("renderError:", source?.uri, _style);

    let { width, height } = getWH(_style);

    console.log("width height", width, height);

    let w = width; // 340 / 3
    let h = height; // 260 / 3;
    if (!width || !height) {
      //兜底一个宽高
      w = 340 / 3;
      h = 260 / 3;
    }

    return (
      <View
        style={[
          _style,
          {
            position: "absolute",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10,
          },
        ]}
      >
        <Image
          source={errorSource ?? require("./load_error.png")}
          style={{
            width: w,
            height: h,
          }}
          resizeMode={errorSource ? "cover" : "contain"}
        />
      </View>
    );
  };

  return (
    <FastImage
      style={_style}
      resizeMode={resizeMode ?? FastImage.resizeMode.cover}
      onLoad={(e) => {
        //console.log("onLoad::", source?.uri);
        onLoad?.(e);
      }}
      onLoadStart={onLoadStart}
      onLoadEnd={onLoadEnd}
      onError={onLoadError}
      source={source}
      onLayout={(e) => {
        //console.log("onLayout:", e.nativeEvent.layout);
      }}
    >
      {props.children}
      {/* {isWebImage && loadStatus == kLoadStatus.PENDING && renderPending()} */}
      {isWebImage && loadStatus == kLoadStatus.ERROR && renderError()}
    </FastImage>
  );
});

const kLoadStatus = {
  IDLE: "IDLE",
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  ERROR: "ERROR",
};

function useWebImage({ source }) {
  const uri = source?.uri;

  const [loadStatus, setLoadStatus] = useState(kLoadStatus.IDLE);
  const isLoadEndRef = useRef(false); //用于解决onLoadError回调后，居然还会走onLoadEnd回调的问题 （判断error走了 end方法就不处理state了）

  useEffect(() => {
    console.log("setLoadStatus(kLoadStatus.IDLE):", uri);
    setLoadStatus(kLoadStatus.IDLE);
    isLoadEndRef.current = false;
  }, [uri]);

  const onLoadStart = () => {
    // console.log("onLoadStart~");
    setLoadStatus(kLoadStatus.PENDING);
  };

  const onLoadEnd = (e) => {
    // console.log("onLoadEnd~ loadStatus", e, loadStatus);
    !isLoadEndRef.current && setLoadStatus(kLoadStatus.SUCCESS);
    isLoadEndRef.current = true;
  };

  const onLoadError = () => {
    // console.log("onLoadError~");
    setLoadStatus(kLoadStatus.ERROR);
    isLoadEndRef.current = true;
  };

  return {
    loadStatus,
    onLoadStart,
    onLoadEnd,
    onLoadError,
  };
}

// 对style修复 （未设置宽高的，设置兜底宽高20）
const amendStyle = (style) => {
  //对于style未给宽高的，甚至style都undefined，设置兜底宽高20
  const extraStyle = { minWidth: 20, minHeight: 20 };

  let _style;
  const { width, height } = getWH(_style);
  if (!width || !height) {
    _style = Array.isArray(style)
      ? [...style, extraStyle]
      : [style, extraStyle];
  }
  if (!_style) {
    _style = style;
  }

  return _style;
};

// 从style获取宽高
const getWH = (style) => {
  let w = 0;
  let h = 0;
  if (Array.isArray(style)) {
    // 从后往前遍历，取最后一个有宽高的对象
    for (let index = style.length - 1; index >= 0; index--) {
      let obj = style[index];
      if (!w && obj?.width) {
        w = obj.width;
      }
      if (!h && obj?.height) {
        h = obj.height;
      }
      if (w && h) {
        break;
      }
    }
  } else {
    let obj = style;
    if (obj?.width) {
      w = obj.width;
    }
    if (obj?.height) {
      h = obj.height;
    }
  }
  return { width: w, height: h };
};


/*
使用示例
```javascript
import HBImage from "app/components/image/HBImage";
import { getSize, parseSize } from "app/utils/image/measurer";


const FeedItem = (props) => {

  const coverUrl = useMemo(
    () => getImageUrl(item.coverUrl, imageWidth), //oss resize 拼接url
    [item.coverUrl]
  );

  const imageHeightFromUrl = useMemo(() => {
    return getHeightFromSize(parseSize(coverUrl)); // parseSize从url(..._720-1080.png...)中解析出宽高 【正常100%都能取出】
  }, [coverUrl]);

  const [imageHeight, setImageHeight] = useState(imageHeightFromUrl);

  useEffect(() => {
    if (!(imageHeightFromUrl > 0)) { 
    //若从url中未能解析出宽高，就通过RN官方Image.getSize方式获取宽高 【正常100%不可能走这里头】
      let h = imageSize;
      getSize(coverUrl)
        .then((size) => {
          if (size) {
            h = getHeightFromSize(size);
          }
          setImageHeight(h);
          kImageHeightCache[coverUrl] = h;
        })
        .catch((err) => {
          setImageHeight(h);
        });
    } else {
      kImageHeightCache[coverUrl] = imageHeightFromUrl;
    }
  }, [coverUrl])

  
  return <>
    {imageHeightFromUrl || imageHeight ? (
        <HBImage
          style={[
            localStyles.image,
            {
              height: imageHeightFromUrl > 0 ? imageHeightFromUrl : imageHeight,
            },
          ]}
          source={{ uri: coverUrl }}
          resizeMode={"contain"}
          errorSource={require("app/components/image/default_cover_720-1080.png")}
        />
      ) : null}
  </>
}

const getHeightFromSize = (size) => {
  if (!(size?.width > 0) || !(size?.height > 0)) return 0;
  return Math.min((imageSize * size.height) / size.width, maxImageHeight);
};

```
*/

