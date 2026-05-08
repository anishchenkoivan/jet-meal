//
//  JetMealWebViewStore.swift
//  jet-meal
//

import Combine
import WebKit

/// Позволяет из SwiftUI вызывать `reload` / `goBack` на созданном `WKWebView`.
final class JetMealWebViewStore: ObservableObject {
    weak var webView: WKWebView?

    var canGoBack: Bool {
        webView?.canGoBack ?? false
    }

    func reload() {
        webView?.reload()
    }

    func goBack() {
        webView?.goBack()
    }

    /// Вызывать после навигации, чтобы SwiftUI обновила доступность «Назад».
    func notifyNavigationChanged() {
        objectWillChange.send()
    }
}
