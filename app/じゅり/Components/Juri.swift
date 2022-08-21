//
//  Juri.swift
//  みのり
//
//  Created by Phumrapee Limpianchop on 2022/08/12.
//

import SwiftUI
import SwiftUIGIF

struct Juri: View {
  private var imageURL = URL(
    string: "https://c.tenor.com/P4fWXm4UQNcAAAAC/アイドルマスターシャイニーカラーズ-西城樹里.gif"
      .addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed)!
  )
  private var imageScale = 0.7
  @State private var imageData: Data? = nil

  var body: some View {
    HStack {
      if let data = imageData {
        GIFImage(data: data)
          .frame(width: 498 * imageScale, height: 280 * imageScale)
          .cornerRadius(8)
      }
    }
    .task {
      let task = URLSession.shared.dataTask(with: imageURL!) {
        data, response, error in
        self.imageData = data
      }
      task.resume()
    }
  }
}

struct Juri_Previews: PreviewProvider {
  static var previews: some View {
    Juri()
  }
}
