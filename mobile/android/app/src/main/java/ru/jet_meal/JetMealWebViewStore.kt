package ru.jet_meal

import android.webkit.WebView

/** Позволяет из Compose вызывать `reload` / `goBack` на созданном `WebView`. */
class JetMealWebViewStore {
    var webView: WebView? = null
        internal set

    val canGoBack: Boolean
        get() = webView?.canGoBack() == true

    fun reload() {
        webView?.reload()
    }

    fun goBack() {
        webView?.goBack()
    }

    var onNavigationChanged: (() -> Unit)? = null

    /** Вызывать после навигации, чтобы обновилась доступность «Назад». */
    fun notifyNavigationChanged() {
        onNavigationChanged?.invoke()
    }
}
