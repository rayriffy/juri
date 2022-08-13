//
//  Header.swift
//  みのり
//
//  Created by Phumrapee Limpianchop on 2022/08/12.
//

import SwiftUI

struct Header: View {
  var body: some View {
    HStack {
      Text("Minori")
        .font(.system(size: 24))
        .bold()
        .foregroundColor(.white)
      Spacer()
    }
    .padding()
    .padding(.top, 38)
    .background(
      LinearGradient(
        gradient: Gradient(
          colors: [
            Color(red: 0.22, green: 0.74, blue: 0.97),
            Color(red: 0.23, green: 0.51, blue: 0.96)
          ]
        ),
        startPoint: .trailing,
        endPoint: .leading
      )
    )
  }
}

struct Header_Previews: PreviewProvider {
  static var previews: some View {
    Header()
  }
}
