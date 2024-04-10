

import android.graphics.Typeface;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;

import com.chuanglan.shanyan_sdk.OneKeyLoginManager;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;

import java.io.File;
import java.util.Map;


public class WordArtModule extends ReactContextBaseJavaModule {

    private ReactApplicationContext themedReactContext;
    public WordArtModule(@NonNull ReactApplicationContext reactContext) {
        super(reactContext);
        this.themedReactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "CustomFontManager";
    }

    @ReactMethod
    public void loadFontFile(String pFontPath, int pViewHandle,  Promise pPromise) {
        if (pFontPath != null) {
            final View lView = this.getReactApplicationContext().getCurrentActivity().findViewById(pViewHandle);
            if (lView != null) {
                try {
                    File fontFile = new File(pFontPath);
                    if (fontFile.exists()) {
                        // 文件存在
                        Typeface typeface = Typeface.createFromFile(fontFile);
                        // Attempt to coerce the TextView.
                        TextView pTextView = (TextView) (lView);
                        // Assign the Typeface.
                        pTextView.setTypeface(typeface);
                        // Ensure we update the View layout.
//                        pTextView.requestLayout();
                        pTextView.measure(View.MeasureSpec.makeMeasureSpec(pTextView.getMeasuredWidth()-100, View.MeasureSpec.EXACTLY),
                                View.MeasureSpec.makeMeasureSpec(pTextView.getMeasuredHeight(), View.MeasureSpec.EXACTLY));
                        pTextView.layout(0, 0, pTextView.getMeasuredWidth(), pTextView.getMeasuredHeight());
                        pPromise.resolve(Arguments.createMap());
                    } else {
                        pPromise.reject("文件不存在");
                        // 文件不存在
                        Toast.makeText(themedReactContext, "文件不存在", Toast.LENGTH_LONG).show();
                    }

                } catch (final Exception pException) {
                    // Delegate the Exception to the caller.
                    pPromise.reject(pException);
                }
            }else{
                pPromise.reject("lView null");
            }

        }else{
            pPromise.reject("字体文件为null");
        }
    }


}

