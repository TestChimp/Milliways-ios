import Foundation
import TestChimpRum

enum MilliwaysRum {
    static func configureIfNeeded() {
        guard
            let projectId = Bundle.main.object(forInfoDictionaryKey: "TestChimpProjectId") as? String,
            let apiKey = Bundle.main.object(forInfoDictionaryKey: "TestChimpApiKey") as? String,
            !projectId.isEmpty,
            !apiKey.isEmpty
        else {
            #if DEBUG
            print(
                "[Milliways] TestChimp RUM skipped: set user-defined build settings TESTCHIMP_PROJECT_ID and TESTCHIMP_API_KEY (injected into Info.plist)."
            )
            #endif
            return
        }

        let environment = Self.resolvedRumEnvironmentTag()
        let testchimpEndpoint = Self.resolvedBackendURL()

        let version = Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String

        TestChimpRum.initialize(
            TestChimpRumConfig(
                projectId: projectId,
                apiKey: apiKey,
                environment: environment,
                release: version,
                config: .init(
                    maxEventsPerSession: 100,
                    maxRepeatsPerEvent: 12,
                    testchimpEndpoint: testchimpEndpoint
                )
            )
        )
    }

    /// Logical RUM environment for TrueCoverage (must match tags you filter on in TestChimp, e.g. `production`, `staging`, `QA`).
    /// Precedence: `ProcessInfo` **`TESTCHIMP_ENV`** (Xcode scheme / `simctl` launch) → **`TestChimpEnvironment`** in Info.plist (from build setting **`TESTCHIMP_ENV`**) → Debug/Release fallback.
    private static func resolvedRumEnvironmentTag() -> String {
        if let fromProcess = ProcessInfo.processInfo.environment["TESTCHIMP_ENV"], !fromProcess.isEmpty {
            return fromProcess
        }
        if let fromPlist = Bundle.main.object(forInfoDictionaryKey: "TestChimpEnvironment") as? String,
           !fromPlist.isEmpty
        {
            return fromPlist
        }
        #if DEBUG
        return "QA"
        #else
        return "production"
        #endif
    }

    /// RUM ingest base URL. Precedence: process env `TESTCHIMP_BACKEND_URL` ->
    /// Info.plist `TestChimpBackendURL` -> SDK default endpoint.
    private static func resolvedBackendURL() -> String? {
        if let fromProcess = ProcessInfo.processInfo.environment["TESTCHIMP_BACKEND_URL"], !fromProcess.isEmpty {
            return fromProcess
        }
        if let fromPlist = Bundle.main.object(forInfoDictionaryKey: "TestChimpBackendURL") as? String,
           !fromPlist.isEmpty
        {
            return fromPlist
        }
        return nil
    }

    static func emit(_ title: String, metadata: [String: String] = [:]) {
        let meta: [String: Any]? =
            metadata.isEmpty
            ? nil
            : Dictionary(uniqueKeysWithValues: metadata.map { ($0.key, $0.value as Any) })
        TestChimpRum.emit(TestChimpEmitInput(title: title, metadata: meta))
    }

    static func lineItemCountBucket(_ count: Int) -> String {
        switch count {
        case 0: return "0"
        case 1: return "1"
        case 2 ... 5: return "2_5"
        default: return "6_plus"
        }
    }

    static func menuSectionCountBucket(_ count: Int) -> String {
        switch count {
        case 0: return "0"
        case 1: return "1"
        case 2 ... 5: return "2_5"
        default: return "6_plus"
        }
    }
}
