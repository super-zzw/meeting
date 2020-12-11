/* eslint-disable */
class Layouter {
  static getSize(size, width, height) {
    switch (size) {
      case 0:
        return [];
      case 1:
        return [{
          x: 0,
          y: 0
        }];
      case 2:
        return [{
          x: 0,
          y: 0
        },
        {
          x: 0,
          y: height
        }
        ];
      case 3:
        return [{
          x: 0,
          y: 0
        }, {
          x: 0,
          y: height
        }, {
          x: width,
          y: 0
        }];
      case 4:
        return [{
          x: 0,
          y: 0
        }, {
          x: 0,
          y: height
        }, {
          x: width,
          y: 0
        }, {
          x: width,
          y: height
        }];
      case 5:
        return [{
          x: 0,
          y: 0
        }, {
          x: 0,
          y: height
        }, {
          x: width,
          y: 0
        }, {
          x: width,
          y: height
        }, {
          x: width * 2,
          y: 0
        }];
      case 6:
        return [{
          x: 0,
          y: 0
        }, {
          x: 0,
          y: height
        }, {
          x: width,
          y: 0
        }, {
          x: width,
          y: height
        }, {
          x: width * 2,
          y: 0
        }, {
          x: width * 2,
          y: height
        }];
    }
  }
}

export default Layouter;
