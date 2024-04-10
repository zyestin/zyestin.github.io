import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import ArtText from "./ArtText";

const ArtTextDemo = () => {
  const [fontInfoIndex, setFontInfoIndex] = useState(0);

  return (
    <View style={{ flex: 1, padding:100 }}>
      <TouchableOpacity
        style={{padding:10}}
        onPress={() => { setFontInfoIndex((fontInfoIndex + 1) % fontInfoList.length); }}
      >
        <Text>{"Switch Font"}</Text>
      </TouchableOpacity>
      
      <Text style={{ marginVertical: 20 }}>
        {"Current font - " + fontInfoIndex + " - " + fontInfoList[fontInfoIndex].fontName}
      </Text>

      <ArtText
        text="Hello World"
        style={{ fontSize: 20 }}
        fontInfo={fontInfoList[fontInfoIndex]}
      />
    </View>
  );
};

const fontInfoList = [
  {
    fontName: "美呗嘿嘿体",
    fontUrl: "https://imgcn.cdn.com/app/download/fonts/meibeiheiehiti2.ttf",
  },
  ...
];