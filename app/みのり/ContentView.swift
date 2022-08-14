//
//  ContentView.swift
//  みのり
//
//  Created by Phumrapee Limpianchop on 2022/08/10.
//

import SwiftUI

struct ContentView: View {
  @StateObject private var userSession: UserSession = UserSession()
  @State private var inputUsername: String = ""
  
  func login() {
    // get challenge
  }

  var body: some View {
    VStack(alignment: .leading) {
      Text("Username")
        .foregroundColor(
          Color(red: 0.22, green: 0.25, blue: 0.32)
        )
        .fontWeight(.medium)
        .padding(.top, 24)
        .padding(.bottom, 0)
      TextField("", text: $inputUsername)
        .padding(.top, 1)
        .padding(.bottom, 2)
        .textFieldStyle(RoundedBorderTextFieldStyle())
      HStack {
        Button("Login") {}
          .padding(.vertical, 10)
          .padding(.horizontal, 18)
          .background(Color(red: 0.15, green: 0.39, blue: 0.92))
          .foregroundColor(.white)
          .bold()
          .cornerRadius(8)
        Button("Register") {}
          .padding(.vertical, 10)
          .padding(.horizontal, 18)
          .background(Color(red: 0.86, green: 0.92, blue: 1.00))
          .foregroundColor(Color(red: 0.11, green: 0.31, blue: 0.85))
          .bold()
          .cornerRadius(8)
      }
      ProgressView()
      Spacer()
      Juri()
    }
    .padding()
    .padding(.horizontal, 8)
    .frame(
      minWidth: 0,
      maxWidth: .infinity,
      minHeight: 0,
      maxHeight: .infinity,
      alignment: .topLeading
    )
  }
}

struct ContentView_Previews: PreviewProvider {
  static var previews: some View {
    ContentView()
  }
}
