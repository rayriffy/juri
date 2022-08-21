//
//  UserSession.swift
//  みのり
//
//  Created by Phumrapee Limpianchop on 2022/08/12.
//

import Foundation
import Alamofire
import AuthenticationServices
import SwiftyJSON

class UserSession: ObservableObject {
  @Published public var initialize: Bool = true
  @Published public var user: User? = nil
  
  @Published public var isAuthenticating: Bool = false
  @Published public var activeAuthenticationToken: String = ""
  
  private var passkeysHandler: PasskeysHandler?
  
  init() {
    self.passkeysHandler = PasskeysHandler(
      onAuthenticated: {
        self.syncAuthenticationToken()
        self.syncUserProfile()
      },
      onError: { error in
        print(error)
      }
    )

    syncAuthenticationToken()
    syncUserProfile()
  }

  func syncAuthenticationToken () {
    self.activeAuthenticationToken = LocalStorage.authTokenValue
  }
  
  func syncUserProfile() {
    self.isAuthenticating = true
    
    print("sync user profile")

    AF
      .request(
        "https://juri.rayriffy.com/api/user",
        method: .post,
        parameters: [
          "token": self.activeAuthenticationToken
        ],
        encoding: JSONEncoding.default
      )
      .responseJSON { response in
        switch response.result {
        case .success(let userResponse):
          let json = JSON(userResponse)
          
          print(json)

          if (json["success"].boolValue == true) {
            self.user = .init(
              id: json["id"].stringValue,
              username: json["username"].stringValue
            )
          }

          self.isAuthenticating = false
          self.initialize = false
          break
        case .failure(let error):
          self.isAuthenticating = false
          self.initialize = false
          break
        }
      }
  }
  
  func logout () {
    LocalStorage.authTokenValue = ""
    self.activeAuthenticationToken = ""
    self.user = nil
  }
  
  func login (username: String) async {
    self.isAuthenticating = true

    AF
      .request("https://juri.rayriffy.com/api/login", parameters: ["username": username])
      .responseDecodable(of: APIResponseWithData<LoginGetResponse>.self) { response in
        switch response.result {
        case .success(let loginGetResponse):
          self.passkeysHandler!.getCredentials(
            allowedCredentials: loginGetResponse.data.allowedCredentials,
            challenge: loginGetResponse.data.challenge
          )
          break
        case .failure(let error):
          print("failed to fetch GET /api/login: \(error)")
          self.isAuthenticating = false
          break
        }
      }
  }
}
