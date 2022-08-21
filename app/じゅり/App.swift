//___FILEHEADER___

import SwiftUI

@main
struct MainApp: App {
  var body: some Scene {
    WindowGroup {
      VStack(alignment: .leading) {
        Header()
        ContentView()
      }
      .ignoresSafeArea(.container, edges: [.top])
      .frame(
        minWidth: 0,
        maxWidth: .infinity,
        minHeight: 0,
        maxHeight: .infinity,
        alignment: .topLeading
      )
    }
  }
}
