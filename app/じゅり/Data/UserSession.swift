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
  
  @MainActor @Published public var isAuthenticating: Bool = false
  @Published public var activeAuthenticationToken: String = ""
  
  private var passkeysHandler: PasskeysHandler?
  
  init() {
    self.passkeysHandler = PasskeysHandler(
      onAuthenticated: {
        self.syncAuthenticationToken()
        Task {
          await self.syncUserProfile()
        }
      },
      onError: { error in
        print(error)
      }
    )

    syncAuthenticationToken()
    Task {
     await  syncUserProfile()
    }
  }

  func syncAuthenticationToken () {
    self.activeAuthenticationToken = LocalStorage.authTokenValue
  }
  
  func syncUserProfile() async {
    await MainActor.run {
      self.isAuthenticating = true
    }
    print("sync user profile")

    AF
      .request(
        "https://polyset.xyz:5173/api/user",
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
          Task {
            await MainActor.run {
              self.isAuthenticating = false
            }
          }
          self.initialize = false
          break
        case .failure(let error):
          print(error)
          Task {
            await MainActor.run {
              self.isAuthenticating = false
            }
          }
          
          self.initialize = false
          break
        }
      }
  }
  func getRegistrationOptions(username: String, completionHandler: @escaping (APIResponseWithData<RegisterGetResponse>) -> Void) {
    AF
      .request("https://polyset.xyz:5173/api/register?username=\(username)", method: .get)
      .responseDecodable(of: APIResponseWithData<RegisterGetResponse>.self) { response in
      switch response.result {
      case .success(let registerResponse):
        completionHandler(registerResponse)
      case .failure:
        print("Error: \(response.error?.errorDescription ?? "unknown error")")
        
        
        
      }
    }
  }
  
  func registerWith(userName: String) async {
    let publicKeyCredentialProvider = ASAuthorizationPlatformPublicKeyCredentialProvider(relyingPartyIdentifier: "polyset.xyz")
    getRegistrationOptions(username: userName) { registerGetResponse in
      let challenge = Data(base64Encoded: registerGetResponse.data.challenge)
      let userID = Data(base64Encoded: registerGetResponse.data.uid)
      let registrationRequest = publicKeyCredentialProvider.createCredentialRegistrationRequest(challenge: challenge!,
                                                                                                name: userName, userID: userID!)
      self.passkeysHandler!.registrationRequest(authorizationRequest: [registrationRequest])
      

      
    }
  }
  func logout () {
    LocalStorage.authTokenValue = ""
    self.activeAuthenticationToken = ""
    self.user = nil
  }
  
  func login (username: String) async {
    await MainActor.run {
      self.isAuthenticating = true
    }
    AF
      .request("https://polyset.xyz:5173/api/login", parameters: ["username": username])
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
          Task {
            
            await MainActor.run {
              self.isAuthenticating = false
            }
          }
          break
        }
      }
  }
}
