//
//  CustomFontManager.m
//  HuabenApp
//
//  Created by yestin ✨ on 2023/7/25.
//  Copyright © 2023 Liangzishidai. All rights reserved.
//

#import "CustomFontManager.h"
#import <CoreText/CoreText.h>


@interface CustomFontManager ()
@property(nonatomic, strong) NSMutableDictionary *loadedFontDict;
@end

@implementation CustomFontManager

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(loadFontFile:(NSString *) path
                  viewId:(int)viewId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  DDLogInfo(@"%s loadFont:%@, viewId:%@", __func__, path, @(viewId));
  
  if (self.loadedFontDict[path] && [self.loadedFontDict[path] boolValue]) {
    DDLogInfo(@"loaded before");
    resolve(@"ok");
    return;
  }
  
  BOOL loadResult = [self _loadFontFile:path];
  self.loadedFontDict[path] = @(loadResult);
  DDLogInfo(@"load result: %@", @(loadResult));
  
  resolve(loadResult ? @"ok" : @"failed");
}


- (BOOL) _loadFontFile:(NSString*)path
{
    NSData *data = [[NSFileManager defaultManager] contentsAtPath:path];
    if (!data) return NO;

    CFErrorRef error;
    CGDataProviderRef provider = CGDataProviderCreateWithCFData((CFDataRef)data);
    if (!provider) return NO;
  
    CGFontRef font = CGFontCreateWithDataProvider(provider);
    if (! CTFontManagerRegisterGraphicsFont(font, &error)) {
        CFStringRef errorDescription = CFErrorCopyDescription(error);
        NSLog(@"Failed to load font: %@", errorDescription);
        CFRelease(errorDescription);
    }

    if (!font) {
      if (provider) CFRelease(provider);
      return NO;
    }
    
    CFRelease(font);
    CFRelease(provider);
    return YES;
}

-(NSMutableDictionary *)loadedFontDict {
  if (!_loadedFontDict) {
    _loadedFontDict = [NSMutableDictionary dictionary];
  }
  return _loadedFontDict;
}

@end
