package com.example

import android.annotation.SuppressLint
import android.content.Context
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.viewinterop.AndroidView
import com.example.ui.theme.DarkNavyBg
import com.example.ui.theme.MindSphereTheme

class MainActivity : ComponentActivity() {

  private var gameWebView: WebView? = null

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()

    setContent {
      MindSphereTheme {
        Scaffold(
          contentWindowInsets = WindowInsets(0, 0, 0, 0),
          modifier = Modifier.fillMaxSize()
        ) { _ ->
          MindSphereGameScreen(
            onWebViewCreated = { webView -> gameWebView = webView }
          )
        }

        BackHandler {
          gameWebView?.evaluateJavascript(
            """
            (function() {
              if (window.Game) {
                const uiHud = document.getElementById('ui-hud');
                const isHudVisible = uiHud && uiHud.style.display !== 'none';
                const pauseModal = document.getElementById('modal-pause');
                const isPaused = pauseModal && pauseModal.classList.contains('active');
                if (isHudVisible && !isPaused) {
                  window.Game.pauseGame();
                  return true;
                } else if (isHudVisible && isPaused) {
                  window.Game.exitToMenu();
                  return true;
                } else {
                  const anyModal = document.querySelector('.screen-overlay.modal.active');
                  if (anyModal) {
                    window.Game.closeAllModals();
                    return true;
                  }
                }
              }
              return false;
            })()
            """.trimIndent()
          ) { handledResult ->
            if (handledResult != "true") {
              finish()
            }
          }
        }
      }
    }
  }

  override fun onPause() {
    super.onPause()
    gameWebView?.onPause()
  }

  override fun onResume() {
    super.onResume()
    gameWebView?.onResume()
  }

  override fun onDestroy() {
    gameWebView?.destroy()
    gameWebView = null
    super.onDestroy()
  }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun MindSphereGameScreen(
  onWebViewCreated: (WebView) -> Unit,
  modifier: Modifier = Modifier
) {
  val context = LocalContext.current
  val bridge = remember { AndroidBridge(context) }

  Box(
    modifier = modifier
      .fillMaxSize()
      .background(DarkNavyBg)
      .testTag("game_screen_container")
  ) {
    AndroidView(
      modifier = Modifier
        .fillMaxSize()
        .testTag("mindsphere_webview"),
      factory = { ctx ->
        WebView(ctx).apply {
          layoutParams = android.view.ViewGroup.LayoutParams(
            android.view.ViewGroup.LayoutParams.MATCH_PARENT,
            android.view.ViewGroup.LayoutParams.MATCH_PARENT
          )
          setBackgroundColor(0xFF060913.toInt())
          settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = true
            allowContentAccess = true
            @Suppress("DEPRECATION")
            allowFileAccessFromFileURLs = true
            @Suppress("DEPRECATION")
            allowUniversalAccessFromFileURLs = true
            databaseEnabled = true
            useWideViewPort = true
            loadWithOverviewMode = true
            cacheMode = WebSettings.LOAD_DEFAULT
            setSupportZoom(false)
            mediaPlaybackRequiresUserGesture = false
          }

          webViewClient = object : WebViewClient() {
            override fun onReceivedError(view: WebView?, errorCode: Int, description: String?, failingUrl: String?) {
              android.util.Log.e("MindSphereWeb", "Error $errorCode: $description at $failingUrl")
            }
          }
          webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(consoleMessage: android.webkit.ConsoleMessage?): Boolean {
              android.util.Log.d("MindSphereWeb", "${consoleMessage?.message()} -- line ${consoleMessage?.lineNumber()}")
              return true
            }
          }

          addJavascriptInterface(bridge, "AndroidBridge")
          loadUrl("file:///android_asset/game/index.html")
          onWebViewCreated(this)
        }
      }
    )
  }
}

class AndroidBridge(private val context: Context) {

  private val prefs = context.getSharedPreferences("mindsphere_save", Context.MODE_PRIVATE)

  @JavascriptInterface
  fun vibrate(milliseconds: Long) {
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
        vibratorManager?.defaultVibrator?.vibrate(
          VibrationEffect.createOneShot(milliseconds.coerceIn(10, 500), VibrationEffect.DEFAULT_AMPLITUDE)
        )
      } else {
        @Suppress("DEPRECATION")
        val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          vibrator?.vibrate(
            VibrationEffect.createOneShot(milliseconds.coerceIn(10, 500), VibrationEffect.DEFAULT_AMPLITUDE)
          )
        } else {
          @Suppress("DEPRECATION")
          vibrator?.vibrate(milliseconds.coerceIn(10, 500))
        }
      }
    } catch (_: Exception) {}
  }

  @JavascriptInterface
  fun saveData(json: String) {
    prefs.edit().putString("game_data", json).apply()
  }

  @JavascriptInterface
  fun loadData(): String {
    return prefs.getString("game_data", "") ?: ""
  }

  @JavascriptInterface
  fun logEvent(event: String) {
    android.util.Log.d("MindSphere3D", "Event: $event")
  }

  @JavascriptInterface
  fun isNativeApp(): Boolean = true
}
