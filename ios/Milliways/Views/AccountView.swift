//
//  AccountView.swift
//  Milliways
//

import SwiftUI

struct AccountView: View {
    @Environment(\.dismiss) var dismiss
    @ObservedObject var sessionManager: SessionManager
    @State private var orders: [BackendOrder] = []
    @State private var isLoadingOrders = false
    @State private var ordersError: String?
    @State private var refundingOrderId: Int?
    @State private var refundAlertMessage: String?
    @State private var showRefundAlert = false

    var totalSpent: Double {
        Double(orders.reduce(0) { $0 + $1.totalCents }) / 100
    }

    var body: some View {
        NavigationView {
            List {
                // Profile header
                Section {
                    HStack(spacing: 16) {
                        VStack(alignment: .leading, spacing: 6) {
                            Text(sessionManager.user?.email ?? "Signed in")
                                .font(.system(size: 26, weight: .bold))
                            Text("Pro Cosmic Foodie")
                                .font(.subheadline)
                                .foregroundColor(.orange)
                        }

                        Spacer()

                        Image("Avatar")
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                            .frame(width: 70, height: 70)
                            .clipShape(Circle())
                            .overlay(Circle().stroke(Color.orange, lineWidth: 2))
                    }
                    .padding(.vertical, 8)
                }

                // Stats
                Section {
                    HStack {
                        VStack {
                            Text("\(orders.count)")
                                .font(.title)
                                .fontWeight(.bold)
                            Text("Orders")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        .frame(maxWidth: .infinity)

                        Divider()

                        VStack {
                            Text("₭\(totalSpent, specifier: "%.2f")")
                                .font(.title)
                                .fontWeight(.bold)
                            Text("Total Spent")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        .frame(maxWidth: .infinity)

                        Divider()

                        VStack {
                            Text("19")
                                .font(.title)
                                .fontWeight(.bold)
                            Text("Light-years")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        .frame(maxWidth: .infinity)
                    }
                    .padding(.vertical, 8)
                }

                Section(header: Text("Past Orders")) {
                    if isLoadingOrders {
                        ProgressView("Loading orders...")
                    } else if let ordersError {
                        Text(ordersError)
                            .foregroundColor(.red)
                    } else if orders.isEmpty {
                        Text("No orders yet")
                            .foregroundColor(.secondary)
                    } else {
                        ForEach(orders) { order in
                            OrderHistoryRow(
                                order: order,
                                isRequestingRefund: refundingOrderId == order.id,
                                onRefund: { Task { await requestRefund(for: order) } }
                            )
                        }
                    }
                }

                Section {
                    Button("Sign Out", role: .destructive) {
                        sessionManager.signOut()
                        dismiss()
                    }
                }
            }
            .navigationTitle("My Account")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.secondary)
                    }
                }
            }
            .task {
                await loadOrders()
            }
            .alert("Refund Request", isPresented: $showRefundAlert) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(refundAlertMessage ?? "")
            }
        }
    }

    @MainActor
    private func loadOrders() async {
        guard let token = sessionManager.token else { return }
        isLoadingOrders = true
        ordersError = nil

        do {
            orders = try await APIClient.shared.fetchOrders(token: token)
        } catch {
            ordersError = error.localizedDescription
        }

        isLoadingOrders = false
    }

    @MainActor
    private func requestRefund(for order: BackendOrder) async {
        guard let token = sessionManager.token else { return }
        guard order.refundEligible == true, order.refundRequested != true else { return }

        refundingOrderId = order.id

        do {
            let response = try await APIClient.shared.requestRefund(orderId: order.id, token: token)
            refundAlertMessage = response.message
            showRefundAlert = true
            await loadOrders()
        } catch {
            refundAlertMessage = error.localizedDescription
            showRefundAlert = true
        }

        refundingOrderId = nil
    }
}

private struct OrderHistoryRow: View {
    let order: BackendOrder
    let isRequestingRefund: Bool
    let onRefund: () -> Void

    private var refundButtonEnabled: Bool {
        order.refundEligible == true && order.refundRequested != true && !isRequestingRefund
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Order #\(order.id)")
                        .font(.headline)
                    Text(orderDisplayStatus)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Spacer()

                Text("₭\(Double(order.totalCents) / 100, specifier: "%.2f")")
                    .font(.headline)
                    .foregroundColor(.orange)
            }

            HStack {
                Spacer()
                if isRequestingRefund {
                    ProgressView()
                        .controlSize(.small)
                } else {
                    Button(action: onRefund) {
                        Text("Refund")
                            .font(.subheadline.weight(.semibold))
                    }
                    .buttonStyle(.bordered)
                    .disabled(!refundButtonEnabled)
                    .accessibilityLabel("Request Refund")
                    .accessibilityHint(refundButtonHint)
                }
            }
        }
        .padding(.vertical, 4)
    }

    private var orderDisplayStatus: String {
        if order.refundRequested == true {
            return "Refund pending"
        }
        return order.status.capitalized
    }

    private var refundButtonHint: String {
        if order.refundRequested == true {
            return "Refund already requested"
        }
        if order.refundEligible != true {
            return "Refund requests are only available for orders less than 2 days old"
        }
        return "Request a refund for this order"
    }
}
