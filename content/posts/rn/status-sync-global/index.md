---
title: "最佳实践 点赞(收藏等)状态的全局同步更新"
date: 2023-12-18T12:00:11+08:00
draft: false
categories: [react-native]
tags: [best-practice, react-native]
---


# 有这么一个常见的需求

在对某个帖子进行`点赞`后，该帖子所出现的各个地方，e.g.帖子列表(可能多处)、帖子详情(可能多个)，`点赞`状态实时同步、数量加/减1同步。

## iOS 方案
在`iOS`，我是在每个帖子 所对应的 Model(数据)对象里 监听通知，判断 帖子ID，ID匹配 则更新 `点赞`状态，以此达到操作`点赞`后 实时同步同一帖子的`点赞`状态，非常简单好使！


## RN 方案
> 但RN里，数据是一个`{id:xx, ...}`这样的对象，是不支持像在iOS那样，在这样对象里 写监听通知的代码的。

于是，那就放到hooks去实现。

#### Q：那需要什么样的hooks呢？

A：也就是需要怎样的 **设计最优雅的API**，or调用方式 （如下），才是决定了设计什么样的hooks函数


### **最优雅API** 调用方式
```javascript

const PostComp = () => {
  const {
    isActive: liked,
    activeCount: likeCount,
    changeActiveStatus: changeLikeStatus,
  } = useActiveStatus({
    id: id,
    originalActiveCount: originalLikeCount,
    originalActiveStatus: originalLikedStatus,
    notificationKey: kPostLikeStatusChangeNotification,
    requestFunc: ({ isActive }) => {
      return likePost({ postId: id, isLike: isActive }); // send request to toggle liked status
    },
  });

  return (
  	<View>
  	  <Icon liked={liked} />
	  <Text>{likeCount}</Text>
	  <Button onPress={() => { changeLikeStatus() }} />
  	</View>
  	)

}

```

`useActiveStatus`这个hooks的实现源码， 如下

### 源码

把`iOS Model里的`通知 放到`hooks`函数里，如下 源码`useActiveStatus`

```javascript
import { useEffect, useState } from "react";
import { listen, emit } from "app/utils/Notification/index";

/**
 * 0 1 状态管理工具
 * @param {function} id 目标对象id
 * @param {string} props.notificationKey active状态变化时 发出通知名称
 * @param {boolean} props.originalActiveCount 初始active数量
 * @param {boolean} props.originalActiveStatus 初始active状态
 * @param {function} props.requestFunc({id, isActive}) active状态变更函数
 * @returns {boolean} isActive
 * @returns {number}  activeCount
 * @returns {function} changeActiveStatus()
 */
export default function useActiveStatus(props) {
  const {
    notificationKey,
    originalActiveCount,
    originalActiveStatus,
    requestFunc,
    id,
  } = props;
  const [isActive, setIsActive] = useState(originalActiveStatus);
  const [activeCount, setActiveCount] = useState(originalActiveCount);

  useEffect(() => {
    setIsActive(originalActiveStatus);
  }, [originalActiveStatus, id]);

  useEffect(() => {
    setActiveCount(originalActiveCount);
  }, [originalActiveCount, id]);

  useEffect(() => {
    const listener = listen(notificationKey, ({ id: _id, isActive }) => {
      // console.log("useActiveStatus:", isActive);
      if (_id == id) {
        if (isActive) {
          setActiveCount(activeCount + 1);
        } else {
          setActiveCount(activeCount - 1 >= 0 ? activeCount - 1 : 0);
        }
        setIsActive(isActive);
      }
    });
    return () => {
      listener.remove();
    };
  }, [isActive, requestFunc, notificationKey, id, activeCount]);

  const changeActiveStatus = () => {
    return requestFunc({ isActive }).then((res) => {
      console.log("changeFollowStatus:", notificationKey, id, !isActive);
      emit(notificationKey, {
        id: id,
        isActive: !isActive,
      });
      return Promise.resolve();
    });
  };

  return {
    isActive,
    activeCount,
    changeActiveStatus,
  };
}

```

