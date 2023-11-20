//"use strict"
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { MasonryFlashList } from "@shopify/flash-list";
import { px2W, px2dp } from "app/utils/ScreenUtils";
import EmptyView from "app/components/empty/index";
import { useImmer } from "use-immer";

import { PropTypes } from "prop-types";

const kHasMoreStatus = {
  UNKNOWN: -1,
  HAS_NO_MORE: 0,
  HAS_MORE: 1,
};

/**
 * 基础列表组件
 * * -------------- 请求相关 入参 --------------
 * @param {Function} requestFunc             请求函数  (page) => {}
 * @param {Boolean} disableAutoLoadNew       是否禁用初始化时自动加载(第1页)数据
 * * -------------- 列表组件相关 入参--------------
 * @param {Object} contentContainerStyle     列表容器样式 仅支持 padding、backgroundColor
 * @param {Number} numColumns                列表列数
 * @param {Function} renderItem              item组件渲染  ({item, index}) => {}
 * @param {String} uniqueKey                 列表item的唯一key，eg. 一般取 id 或 userId...
 * * -------------- ref public api --------------
 * @api dataList setDataList loadNew lastSuccessRequestPage
 *
 * * 注意：若需要设置style，请在外层包裹一层View，设置style，而不是直接对BaseList设置style(是无效的)
 */
const BaseList = forwardRef(
  (
    {
      requestFunc,
      disableAutoLoadNew,
      contentContainerStyle,
      numColumns,
      renderItem,
      uniqueKey,
    },
    ref
  ) => {
    const [dataList, setDataList] = useImmer([]);
    const [lastSuccessRequestPage, setLastSuccessRequestPage] = useState(1);
    const [isLoadingNew, setIsLoadingNew] = useState(!disableAutoLoadNew); // 标记 是否loading状态，用于展示、隐藏菊花
    const [isLoadingMore, setIsLoadingMore] = useState(false); // 标记 是否loading状态，用于展示、隐藏菊花
    const [hasMore, setHasMore] = useState(kHasMoreStatus.UNKNOWN); // 标记 是否可加载更多，用于触底时判断是否调用loadMore

    const columnCount = numColumns || 1;
    const estimatedItemSize = px2W(100) / columnCount;

    useImperativeHandle(ref, () => ({
      dataList: dataList,
      setDataList: setDataList,
      loadNew: _loadNew,
      lastSuccessRequestPage: lastSuccessRequestPage,
    }));

    useEffect(() => {
      !disableAutoLoadNew && _loadNew();
    }, []);

    const _loadNew = () => {
      setIsLoadingNew(true);
      setLastSuccessRequestPage(1);

      requestFunc(1)
        .then((data) => {
          setHasMore(data?.length >= 1);
          setDataList(data);
        })
        .finally(() => {
          setIsLoadingNew(false);
        });
    };

    const _loadMore = () => {
      setIsLoadingMore(true);
      requestFunc(lastSuccessRequestPage + 1)
        .then((data) => {
          setHasMore(data?.length >= 1);
          setLastSuccessRequestPage(lastSuccessRequestPage + 1);
          setDataList([...dataList, ...data]);
        })
        .finally(() => {
          setIsLoadingMore(false);
        });
    };

    return isLoadingNew ? (
      <ActivityIndicator
        animating
        size="small"
        color="black"
        style={{
          justifyContent: "center",
          alignItems: "center",
          marginTop: px2dp(150),
        }}
      />
    ) : (
      <MasonryFlashList
        contentContainerStyle={contentContainerStyle}
        estimatedItemSize={estimatedItemSize}
        data={dataList}
        keyExtractor={(item, index) => item?.[uniqueKey] || index.toString()}
        initialNumToRender={5}
        numColumns={columnCount}
        renderItem={renderItem}
        onEndReachedThreshold={0.1}
        onEndReached={() => {
          console.log("list onEndReached moreLoadable:", hasMore);
          if (hasMore == kHasMoreStatus.HAS_MORE) {
            _loadMore();
          }
        }}
        ListFooterComponent={() => (
          <View
            style={{
              height: px2dp(50),
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text>
              {isLoadingMore
                ? "正在加载..."
                : dataList?.length && hasMore == kHasMoreStatus.HAS_NO_MORE
                ? "已到底~"
                : ""}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          !dataList?.length && hasMore == kHasMoreStatus.HAS_NO_MORE ? (
            <EmptyView msg={"暂无数据"} />
          ) : null
        }
      />
    );
  }
);

BaseList.propTypes = {
  style: PropTypes.object,
  requestFunc: PropTypes.func.isRequired,
  renderItem: PropTypes.func.isRequired,
  uniqueKey: PropTypes.string.isRequired,
  numColumns: PropTypes.number,
  disableAutoLoadNew: PropTypes.bool,
};

export default BaseList;

/************************ 示例 *************************/
/*
import BaseList from "app/components/list/base";

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
*/
