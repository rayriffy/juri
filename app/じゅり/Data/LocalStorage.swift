//
//  LocalStorage.swift
//  みのり
//
//  Created by Phumrapee Limpianchop on 2022/08/12.
//

import Foundation

class LocalStorage {
  private static var authTokenKey: String = "authenticationToken"
  
  public static var authTokenValue: String {
    set {
      UserDefaults.standard.set(newValue, forKey: authTokenKey)
    }
    get {
      return UserDefaults.standard.string(forKey: authTokenKey) ?? ""
    }
  }
}
