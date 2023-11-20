---
title: "封装常用基础组件"
date: 2023-11-01T12:00:11+08:00
draft: true
---


* 瀑布流列表base组件

源码[BaseList.js](./BaseList.js)

> 将下拉刷新、上拉加载更多相关的 pageNo逻辑，封装到BaseList中，使用方仅需关注 数据请求的api，让使用方代码量降到最少。

使用示例
```javascript
import BaseList from "app/components/list/base";
import { getFanList } from "./service";

const pageSize = 10;

const FanList = (props) => {
  const { userId } = props;
  const _requestFunc = (page, pageSize) => {
    return getFanList({ userId: userId, pageNo: page, pageSize });
  };

  const _renderItem = ({ item, index }) => {
    return <Item {...item} />;
  };

  return (
    // <View style={{ flex: 1 }}>
    <BaseList
      requestFunc={(page) => _requestFunc(page, pageSize)}
      contentContainerStyle={{
        paddingVertical: px2dp(5),
        paddingLeft: px2dp(5),
      }}
      renderItem={_renderItem}
      // numColumns={1}
      uniqueKey={"userId"}
    />
    // </View>
  );
};

```

