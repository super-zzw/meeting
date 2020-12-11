/* eslint-disable sonarjs/no-duplicated-branches */
/* eslint-disable no-case-declarations */
class Layouter {
  constructor(containerWidth, containerHeight) {
    this.containerWidth = containerWidth;
    this.containerHeight = containerHeight;
  }

  getSize(totalUser) {
    const videoContainerHeight = this.containerHeight;
    const videoContainerWidth = this.containerWidth;
    switch (totalUser) {
      case 0:
        return [];
      case 1:
        return [{
          x: 0,
          y: 0,
          width: videoContainerWidth,
          height: videoContainerHeight
        }];
      case 2:
        return [{
          x: 0,
          y: 0,
          width: videoContainerWidth,
          height: videoContainerHeight
        },
        {
          x: (videoContainerWidth / 3) * 2,
          y: (videoContainerHeight / 3) * 2 - 103,
          width: videoContainerWidth / 3,
          height: videoContainerHeight / 3
        }
        ];
      case 3:
        return [{
          x: 0,
          y: 0,
          width: videoContainerWidth / 2,
          height: videoContainerHeight / 2
        }, {
          x: videoContainerWidth / 2,
          y: 0,
          width: videoContainerWidth / 2,
          height: videoContainerHeight / 2
        }, {
          x: 0,
          y: videoContainerHeight / 2,
          width: videoContainerWidth / 2,
          height: videoContainerHeight / 2
        }];
      case 4:
        return [{
          x: 0,
          y: 0,
          width: videoContainerWidth / 2,
          height: videoContainerHeight / 2
        }, {
          x: videoContainerWidth / 2,
          y: 0,
          width: videoContainerWidth / 2,
          height: videoContainerHeight / 2
        }, {
          x: 0,
          y: videoContainerHeight / 2,
          width: videoContainerWidth / 2,
          height: videoContainerHeight / 2
        }, {
          x: videoContainerWidth / 2,
          y: videoContainerHeight / 2,
          width: videoContainerWidth / 2,
          height: videoContainerHeight / 2
        }];
      case 5:
        return [{
          x: 0,
          y: 0,
          width: videoContainerWidth / 3,
          height: videoContainerHeight / 3
        }, {
          x: videoContainerWidth / 3,
          y: 0,
          width: videoContainerWidth / 3,
          height: videoContainerHeight / 3
        }, {
          x: (videoContainerWidth / 3) * 2,
          y: 0,
          width: videoContainerWidth / 3,
          height: videoContainerHeight / 3
        }, {
          x: 0,
          y: videoContainerHeight / 3,
          width: videoContainerWidth / 3,
          height: videoContainerHeight / 3
        }, {
          x: videoContainerWidth / 3,
          y: videoContainerHeight / 3,
          width: videoContainerWidth / 3,
          height: videoContainerHeight / 3
        }];
      case 6:
        return [{
          x: 0,
          y: 0,
          width: videoContainerWidth / 3,
          height: videoContainerHeight / 3
        }, {
          x: videoContainerWidth / 3,
          y: 0,
          width: videoContainerWidth / 3,
          height: videoContainerHeight / 3
        }, {
          x: (videoContainerWidth / 3) * 2,
          y: 0,
          width: videoContainerWidth / 3,
          height: videoContainerHeight / 3
        }, {
          x: 0,
          y: videoContainerHeight / 3,
          width: videoContainerWidth / 3,
          height: videoContainerHeight / 3
        }, {
          x: videoContainerWidth / 3,
          y: videoContainerHeight / 3,
          width: videoContainerWidth / 3,
          height: videoContainerHeight / 3
        }, {
          x: (videoContainerWidth / 3) * 2,
          y: videoContainerHeight / 3,
          width: videoContainerWidth / 3,
          height: videoContainerHeight / 3
        }];
      case 7:
        return [{
          x: 0,
          y: 0,
          width: videoContainerWidth / 3,
          height: videoContainerHeight / 3
        }, {
          x: videoContainerWidth / 3,
          y: 0,
          width: videoContainerWidth / 3,
          height: videoContainerHeight / 3
        }, {
          x: (videoContainerWidth / 3) * 2,
          y: 0,
          width: videoContainerWidth / 3,
          height: videoContainerHeight / 3
        }, {
          x: 0,
          y: videoContainerHeight / 3,
          width: videoContainerWidth / 3,
          height: videoContainerHeight / 3
        }, {
          x: videoContainerWidth / 3,
          y: videoContainerHeight / 3,
          width: videoContainerWidth / 3,
          height: videoContainerHeight / 3
        }, {
          x: (videoContainerWidth / 3) * 2,
          y: videoContainerHeight / 3,
          width: videoContainerWidth / 3,
          height: videoContainerHeight / 3
        }, {
          x: 0,
          y: (videoContainerHeight / 3) * 2,
          width: videoContainerWidth / 3,
          height: videoContainerHeight / 3
        }];
    }
  }
}

module.exports = Layouter;
