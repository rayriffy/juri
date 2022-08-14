//
//  UserSession.swift
//  みのり
//
//  Created by Phumrapee Limpianchop on 2022/08/12.
//

import Foundation

class UserSession: ObservableObject {
  @Published private var initialize: Bool = false
  @Published private var user: User? = nil
  
  init() {
    print(LocalStorage.authTokenValue)
  }
}
