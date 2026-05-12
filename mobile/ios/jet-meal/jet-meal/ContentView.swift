//
//  ContentView.swift
//  jet-meal
//

import SwiftUI

struct ContentView: View {
    @StateObject private var webStore = JetMealWebViewStore()

    var body: some View {
        JetMealWebView(
            store: webStore,
            title: .constant(""),
            initialURL: JetMealAppConfiguration.webEntryURL,
            onLoadingChange: nil
        )
        .ignoresSafeArea()
    }
}

#Preview {
    ContentView()
}
