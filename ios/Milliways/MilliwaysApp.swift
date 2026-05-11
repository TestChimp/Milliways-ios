//
//  MilliwaysApp.swift
//  Milliways
//
//  Created by gilm on 05/11/2025.
//

import SwiftUI
import TestChimpRum

@main
struct MilliwaysApp: App {
    init() {
        MilliwaysRum.configureIfNeeded()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .onOpenURL { url in
                    _ = TestChimpRum.handleAutomationURL(url)
                }
        }
    }
}
