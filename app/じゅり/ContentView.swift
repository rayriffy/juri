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

  var body: some View {
    VStack(alignment: .leading) {
      if (userSession.initialize == true) {
        Text("Intitializing...")
        ProgressView()
      } else if (userSession.user == nil) {
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
          Button("Login") {
            Task {
              await userSession.login(username: inputUsername)
            }
          }
            .padding(.vertical, 10)
            .padding(.horizontal, 18)
            .background(Color(red: 0.15, green: 0.39, blue: 0.92))
            .foregroundColor(.white)
            .bold()
            .cornerRadius(8)
          Button("Register") {
            Task {
              await userSession.registerWith(userName: inputUsername)
            }
          }
            .padding(.vertical, 10)
            .padding(.horizontal, 18)
            .background(Color(red: 0.15, green: 0.39, blue: 0.92))
            .foregroundColor(.white)
            .bold()
            .cornerRadius(8)
        }
      } else {
        Text("Hello!").font(.system(size: 32)).bold()
        Juri().padding(.bottom, 16)
        Button("Logout") {
          userSession.logout()
        }
          .padding(.vertical, 10)
          .padding(.horizontal, 18)
          .background(Color(red: 1.00, green: 0.89, blue: 0.89))
          .foregroundColor(Color(red: 0.73, green: 0.11, blue: 0.11))
          .bold()
          .cornerRadius(8)
      }
      Spacer()
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
