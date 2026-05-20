//
//  MenuView.swift
//  Milliways
//
//  Created by gilm on 05/11/2025.
//

import SwiftUI

private struct MenuItemSelection: Identifiable {
    let item: MenuItem
    let sectionKey: String
    var id: Int { item.id }
}

struct MenuView: View {
    @ObservedObject var orderManager: OrderManager
    @ObservedObject var sessionManager: SessionManager
    @Binding var popToRoot: Bool
    @State private var selectedItem: MenuItemSelection?
    @State private var menuSections: [MenuSection] = []
    @State private var isLoadingMenu = false
    @State private var menuError: String?

    @Environment(\.dismiss) var dismiss

    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            VStack(spacing: 0) {
                if isLoadingMenu {
                    ProgressView("Loading menu...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if let menuError {
                    VStack(spacing: 12) {
                        Text(menuError)
                            .foregroundColor(.red)
                            .multilineTextAlignment(.center)
                        Button("Try Again") {
                            Task {
                                await loadMenu()
                            }
                        }
                        .buttonStyle(.borderedProminent)
                    }
                    .padding()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    ScrollView {
                        LazyVStack(spacing: 12, pinnedViews: [.sectionHeaders]) {
                            ForEach(menuSections, id: \.title) { section in
                                Section {
                                    ForEach(section.items) { item in
                                        MenuItemCard(item: item)
                                            .onTapGesture {
                                                selectedItem = MenuItemSelection(
                                                    item: item,
                                                    sectionKey: menuSectionKey(from: section.title)
                                                )
                                            }
                                            .padding(.horizontal)
                                    }
                                } header: {
                                    HStack {
                                        Text(section.title)
                                            .font(.headline)
                                            .foregroundColor(.secondary)
                                            .padding(.horizontal)
                                            .padding(.vertical, 8)
                                        Spacer()
                                    }
                                    .background(Color(.systemBackground))
                                }
                            }

                            Text("* Shipping beyond 5 light-years distance might cost extra")
                                .font(.footnote)
                                .foregroundColor(.secondary)
                                .italic()
                                .padding(.horizontal)
                                .padding(.top, 20)
                                .padding(.bottom, 40)
                        }
                        .padding(.vertical)
                    }
                }

                if orderManager.items.count > 0 {
                    NavigationLink(destination: OrderView(
                        orderManager: orderManager,
                        sessionManager: sessionManager,
                        popToRoot: $popToRoot
                    )) {
                        HStack {
                            Text("View Order")
                                .font(.headline)
                            Spacer()
                            Text("\(orderManager.totalQuantity) items")
                                .font(.subheadline)
                            Text("₭\(orderManager.totalPrice, specifier: "%.2f")")
                                .font(.headline)
                        }
                        .foregroundColor(.white)
                        .padding()
                        .background(Color.orange)
                        .cornerRadius(12)
                        .padding()
                    }
                }
            }

        }
        .navigationTitle("Milliways")
        .navigationBarBackButtonHidden(true)
        .toolbarBackground(.hidden, for: .navigationBar)
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button(action: { dismiss() }) {
                    Image(systemName: "chevron.left")
                        .foregroundColor(.accentColor)
                }
            }
            ToolbarItem(placement: .navigationBarTrailing) {
                NavigationLink(destination: OrderView(
                    orderManager: orderManager,
                    sessionManager: sessionManager,
                    popToRoot: $popToRoot
                )) {
                    VStack(spacing: 0) {
                        if orderManager.totalQuantity > 0 {
                            Text("\(orderManager.totalQuantity)")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(.white)
                                .frame(width: 16, height: 16)
                                .background(Color.red)
                                .clipShape(Circle())
                        }
                        Image(systemName: "cart")
                            .foregroundColor(.accentColor)
                            .accessibilityLabel("Shopping Cart")
                    }
                }
            }
        }
        .sheet(item: $selectedItem) { selection in
            MenuItemDetailView(
                item: selection.item,
                sectionKey: selection.sectionKey,
                orderManager: orderManager
            )
        }
        .task {
            if menuSections.isEmpty {
                await loadMenu()
            }
        }
    }

    private func menuSectionKey(from title: String) -> String {
        let parts = title.lowercased()
            .components(separatedBy: CharacterSet.alphanumerics.inverted)
            .filter { !$0.isEmpty }
        return parts.isEmpty ? "unknown" : parts.joined(separator: "_")
    }

    @MainActor
    private func loadMenu() async {
        isLoadingMenu = true
        menuError = nil

        do {
            menuSections = try await APIClient.shared.fetchMenu()
        } catch {
            menuError = error.localizedDescription
        }

        isLoadingMenu = false
    }
}
