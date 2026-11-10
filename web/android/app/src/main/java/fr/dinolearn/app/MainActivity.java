package fr.dinolearn.app;

import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import androidx.core.graphics.Insets;
import androidx.core.splashscreen.SplashScreen;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.WebViewListener;
import java.util.Locale;

/**
 * Le jeu en plein écran : barres du système cachées (un glissement depuis le
 * bord les fait réapparaître un instant), décor jusque sous l'encoche de la
 * caméra, et marges de l'encoche passées au jeu (variables CSS --app-safe-*)
 * pour que les boutons restent visibles. Sons et voix sans geste préalable.
 * L'écran de démarrage du système reste affiché jusqu'à ce que la page du jeu
 * (et l'image de l'écran de chargement) soit prête : pas d'écran vide entre les deux.
 */
public class MainActivity extends BridgeActivity {
    private String safeAreaScript = "";
    private volatile boolean pageReady = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        SplashScreen splash = SplashScreen.installSplashScreen(this);
        splash.setKeepOnScreenCondition(() -> !pageReady);
        // Au pire (page lente à charger), on n'attend pas plus de 4 s.
        new Handler(Looper.getMainLooper()).postDelayed(() -> pageReady = true, 4000);
        super.onCreate(savedInstanceState);
        WebView webView = getBridge().getWebView();
        WebSettings settings = webView.getSettings();
        settings.setMediaPlaybackRequiresUserGesture(false);
        hideSystemBars();
        ViewCompat.setOnApplyWindowInsetsListener(getWindow().getDecorView(), (v, insets) -> {
            Insets cut = insets.getInsets(WindowInsetsCompat.Type.displayCutout() | WindowInsetsCompat.Type.systemBars());
            float d = getResources().getDisplayMetrics().density;
            safeAreaScript = String.format(Locale.ROOT,
                "(function(r){if(!r)return;var s=r.style;s.setProperty('--app-safe-left','%.1fpx');s.setProperty('--app-safe-right','%.1fpx');"
                    + "s.setProperty('--app-safe-top','%.1fpx');s.setProperty('--app-safe-bottom','%.1fpx');"
                    + "window.dispatchEvent(new Event('resize'));})(document.documentElement);",
                cut.left / d, cut.right / d, cut.top / d, cut.bottom / d);
            webView.post(() -> webView.evaluateJavascript(safeAreaScript, null));
            return WindowInsetsCompat.CONSUMED;
        });
        getBridge().addWebViewListener(new WebViewListener() {
            @Override
            public void onPageLoaded(WebView view) {
                if (!safeAreaScript.isEmpty()) view.evaluateJavascript(safeAreaScript, null);
                // L'image de l'écran de chargement a le temps d'être peinte avant de quitter le démarrage.
                view.postDelayed(() -> pageReady = true, 120);
            }
        });
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemBars();
    }

    private void hideSystemBars() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            WindowManager.LayoutParams attrs = getWindow().getAttributes();
            attrs.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            getWindow().setAttributes(attrs);
        }
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        controller.hide(WindowInsetsCompat.Type.systemBars());
        controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
    }
}
