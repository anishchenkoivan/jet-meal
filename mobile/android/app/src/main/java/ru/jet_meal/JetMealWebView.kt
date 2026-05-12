package ru.jet_meal

import android.annotation.SuppressLint
import android.graphics.Bitmap
import android.os.Message
import android.view.ViewGroup
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView

/**
 * Встраивание фронтенда Jet Meal (Next.js SSR-сервисы за одним доменом) через WebView.
 * Настройки и поведение согласованы с iOS `JetMealWebView` (WKWebView).
 */
@SuppressLint("SetJavaScriptEnabled")
@Composable
fun JetMealWebView(
    store: JetMealWebViewStore,
    initialUrl: String,
    onLoadingChange: ((Boolean) -> Unit)? = null,
    modifier: Modifier = Modifier,
) {
    val context = LocalContext.current
    var canGoBack by remember { mutableStateOf(false) }

    DisposableEffect(store) {
        val listener: () -> Unit = { canGoBack = store.canGoBack }
        store.onNavigationChanged = listener
        onDispose {
            if (store.onNavigationChanged === listener) {
                store.onNavigationChanged = null
            }
        }
    }

    BackHandler(enabled = canGoBack) {
        store.goBack()
    }

    AndroidView(
        modifier = modifier.fillMaxSize(),
        factory = { ctx ->
            WebView(ctx).apply {
                layoutParams = ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT,
                )

                with(settings) {
                    javaScriptEnabled = true
                    domStorageEnabled = true
                    useWideViewPort = true
                    loadWithOverviewMode = true
                    setSupportMultipleWindows(true)
                    javaScriptCanOpenWindowsAutomatically = true
                    mediaPlaybackRequiresUserGesture = false
                }

                val baseUa = settings.userAgentString
                settings.userAgentString = if (baseUa.isNotBlank()) {
                    "$baseUa JetMealWebView/1"
                } else {
                    "JetMealWebView/1"
                }

                webViewClient = object : WebViewClient() {
                    override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                        super.onPageStarted(view, url, favicon)
                        onLoadingChange?.invoke(true)
                    }

                    override fun onPageFinished(view: WebView?, url: String?) {
                        super.onPageFinished(view, url)
                        onLoadingChange?.invoke(false)
                        store.notifyNavigationChanged()
                    }

                    override fun onReceivedError(
                        view: WebView?,
                        request: WebResourceRequest,
                        error: WebResourceError,
                    ) {
                        super.onReceivedError(view, request, error)
                        if (request.isForMainFrame) {
                            onLoadingChange?.invoke(false)
                            store.notifyNavigationChanged()
                        }
                    }

                    @Deprecated("Deprecated in Java")
                    override fun onReceivedError(
                        view: WebView?,
                        errorCode: Int,
                        description: String?,
                        failingUrl: String?,
                    ) {
                        super.onReceivedError(view, errorCode, description, failingUrl)
                        onLoadingChange?.invoke(false)
                        store.notifyNavigationChanged()
                    }

                    override fun doUpdateVisitedHistory(view: WebView?, url: String?, isReload: Boolean) {
                        super.doUpdateVisitedHistory(view, url, isReload)
                        store.notifyNavigationChanged()
                    }
                }

                webChromeClient = object : WebChromeClient() {
                    /** `window.open` / target=_blank — в том же WebView, как `WKUIDelegate` на iOS. */
                    override fun onCreateWindow(
                        view: WebView,
                        isDialog: Boolean,
                        isUserGesture: Boolean,
                        resultMsg: Message,
                    ): Boolean {
                        val temp = WebView(ctx)
                        temp.webViewClient = object : WebViewClient() {
                            @Deprecated("Deprecated in Java")
                            override fun shouldOverrideUrlLoading(v: WebView, url: String): Boolean {
                                if (JetMealAppConfiguration.isHttpOrHttps(url)) {
                                    view.loadUrl(url)
                                }
                                return true
                            }

                            override fun shouldOverrideUrlLoading(
                                v: WebView,
                                request: WebResourceRequest,
                            ): Boolean {
                                val u = request.url.toString()
                                if (JetMealAppConfiguration.isHttpOrHttps(u)) {
                                    view.loadUrl(u)
                                }
                                return true
                            }
                        }
                        val transport = resultMsg.obj as WebView.WebViewTransport
                        transport.webView = temp
                        resultMsg.sendToTarget()
                        return true
                    }
                }

                store.webView = this
                loadUrl(initialUrl)
            }
        },
        update = { webView ->
            store.webView = webView
        },
    )
}
