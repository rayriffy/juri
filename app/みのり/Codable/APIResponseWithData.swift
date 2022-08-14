//
//  APIResponse.swift
//  みのり
//
//  Created by Phumrapee Limpianchop on 2022/08/12.
//

import Foundation

struct APIResponseWithData<T : Codable>: Codable {
  var message: String
  var data: T
}
