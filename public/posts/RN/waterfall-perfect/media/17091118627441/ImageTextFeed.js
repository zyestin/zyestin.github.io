import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import { getImageUrl, px2dp, px2sp } from "app/utils/ScreenUtils";
import HBImage from "app/components/image/HBImage";
import { getSize, parseSize } from "app/utils/image/measurer";
import InfoView from "./InfoView";
import { getHeightWithText } from "app/utils/text/measurer";

const cellWidth = px2dp(170);
const cellBorderWidth = 0.5;
const imageSize = cellWidth - cellBorderWidth * 2;
const maxImageHeight = px2dp(300);

const kHeightCacheKey = "height";
const kImageHeightCacheKey = "imageHeight";
const kTitleHeightCacheKey = "titleHeight";

export default React.memo(({ item }) => {
  const {
    title,
    previewUri,
    tags,
    id,
    authorId,
    authorAvatar,
    authorNickname,
    liked,
    likeCount,
    cache,
  } = item;

  if (!(cache[kHeightCacheKey] > 0)) {
    console.warn("ImageTextFeed cache height none");
  }

  const coverUrl = useMemo(() => getImageUrl(previewUri, IMG_BOOK_COVER_BIG), [
    previewUri,
  ]);

  const imageHeightFromUrl = cache[kImageHeightCacheKey] || 0;

  const avatarUrl = useMemo(
    () => getImageUrl(authorAvatar, IMG_USER_LIST_PIC),
    [authorAvatar]
  );

  const tag = useMemo(() => {
    return tags?.[0] || "";
  }, [tags]);

  const onItemClick = () => {
    // console.log("onItemClick", title);
    Actions.postDetailsScreen({
      id,
      authorId,
      actionreason: item.scene,
      actiontag: item.algorithm,
    });
  };

  return (
    <TouchableOpacity
      style={[styles.container, { height: cache[kHeightCacheKey] }]}
      onPress={onItemClick}
      activeOpacity={0.8}
    >
      <HBImage
        style={[
          styles.image,
          {
            height: imageHeightFromUrl,
          },
        ]}
        source={{ uri: coverUrl }}
        resizeMode={"contain"}
      />
      <Text
        style={[styles.title, { height: cache[kTitleHeightCacheKey] }]}
        numberOfLines={2}
      >
        {title || "无题"}
      </Text>

      <InfoView
        style={tag?.length && { marginTop: px2dp(5) }}
        tag={tag}
        authorNickname={authorNickname}
        avatarUrl={avatarUrl}
        likeCount={likeCount}
        id={id}
        liked={liked}
        authorId={authorId}
        item={item}
      />
    </TouchableOpacity>
  );
});

const getHeightFromSize = (size) => {
  if (!(size?.width > 0) || !(size?.height > 0)) return 0;
  return Math.min((imageSize * size.height) / size.width, maxImageHeight);
};

export const sizeForItem = (item) => {
  const { previewUri, title, tags, cache } = item;
  console.log("item.cache:", item.cache);
  if (cache[kHeightCacheKey]) return cache[kHeightCacheKey] + px2dp(15);

  let imageHeight = getHeightFromSize(parseSize(previewUri)) || imageSize;
  cache[kImageHeightCacheKey] = imageHeight;

  let titleH = getHeightWithText({
    text: title,
    fontSize: styles.title.fontSize,
    lineHeight: styles.title.lineHeight,
    maxNumberOfLines: 2,
    maxWidth: cellWidth - styles.title.paddingHorizontal * 2,
  });
  cache[kTitleHeightCacheKey] = titleH;

  let totalH =
    Math.ceil(imageHeight) +
    cellBorderWidth * 2 +
    Math.ceil(styles.title.marginTop) +
    Math.ceil(titleH) +
    Math.ceil(tags?.[0] ? px2dp(5) : 0) +
    Math.ceil(tags?.[0] ? px2dp(20) : 0) +
    Math.ceil(px2dp(30));
  cache[kHeightCacheKey] = totalH;

  console.log(
    "ImageTextFeed: sizeForItem:",
    title,
    totalH,
    "titleH:",
    titleH,
    "imageHeight:",
    imageHeight
  );

  return totalH + px2dp(15);
};

const styles = StyleSheet.create({
  container: {
    width: cellWidth,
    backgroundColor: "#fff",
    borderRadius: px2dp(5),
    borderWidth: cellBorderWidth,
    borderColor: "#F5F5F5",
    marginBottom: px2dp(15),
  },
  image: {
    width: imageSize,
    height: imageSize,
    borderRadius: px2dp(5),
  },
  title: {
    color: "#101417",
    fontSize: px2sp(14),
    marginTop: px2dp(8),
    paddingHorizontal: px2dp(8),
    fontWeight: "bold",
    lineHeight: px2dp(20),
  },
});
