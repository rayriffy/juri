//
//  PasskeysHandler.swift
//  みのり
//
//  Created by Phumrapee Limpianchop on 2022/08/21.
//

import Foundation
import AuthenticationServices
import Alamofire

class PasskeysHandler: NSObject, ASAuthorizationControllerPresentationContextProviding, ASAuthorizationControllerDelegate {
  let domain = "juri.rayriffy.com"
  var authenticationAnchor: ASPresentationAnchor?
  var isPerformingModalReqest = false
  
  var onAuthenticated: (() -> Void)?
  var onError: ((any Error) -> Void)?
  
  init (onAuthenticated: (()->())?, onError: ((any Error) -> Void)?) {
    self.onAuthenticated = onAuthenticated
    self.onError = onError
  }

  func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
    return authenticationAnchor!
  }
  
  func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
    self.onError?(error)
  }
  
  func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
    switch authorization.credential {
    case let credentialRegistration as ASAuthorizationPlatformPublicKeyCredentialRegistration:
      print("credential registered: \(credentialRegistration)")
      break

    /**
      Handle assertion response when biometric scan is completed
     */
    case let credentialAssertion as ASAuthorizationPlatformPublicKeyCredentialAssertion:
      print("credential used to sign in: \(credentialAssertion)")
      
      let payload: [String: Any] = [
        "id": credentialAssertion.credentialID.base64EncodedString(),
        "response": [
          "clientDataJSON": credentialAssertion.rawClientDataJSON.base64EncodedString(),
          "authenticatorData": credentialAssertion.rawAuthenticatorData.base64EncodedString(),
          "signature": credentialAssertion.signature.base64EncodedString(),
        ]
      ]
      
      AF.request(
        "https://juri.rayriffy.com/api/login",
        method: .post,
        parameters: payload,
        encoding: JSONEncoding.default
      ).responseDecodable(of: APIResponseWithData<String>.self) {
        response in
        switch response.result {
        case .success(let loginPostResponse):
          LocalStorage.authTokenValue = loginPostResponse.data
          self.onAuthenticated?()
          break
        case .failure(let error):
          self.onError?(error)
          break
        }
      }

      break
    default:
      print("unknown authentication method")
    }
  }
  
  func getCredentials(allowedCredentials: [AllowedCredential], challenge: String) {
    let publicKeyCredentialProvider = ASAuthorizationPlatformPublicKeyCredentialProvider(
      relyingPartyIdentifier: domain
    )
    let decodedChallenge = Data(base64Encoded: challenge)

    let assertionRequest = publicKeyCredentialProvider.createCredentialAssertionRequest(
      challenge: decodedChallenge!
    )
    
    let authenticationController = ASAuthorizationController(
      authorizationRequests: [assertionRequest]
    )
    authenticationController.delegate = self
    authenticationController.presentationContextProvider = self
    authenticationController.performRequests()
  }
}
