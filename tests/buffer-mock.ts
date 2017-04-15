// const packetSizes = [40, 50, 30, 115];
    // const buffer = [
    //   Buffer.alloc(13, 1),
    //   Buffer.alloc(11, 1),
    //   Buffer.alloc(9, 1),
    //   Buffer.alloc(6, 1),
    //   Buffer.alloc(18, 1),
    //   Buffer.alloc(190, 1),
    //   Buffer.alloc(1, 1),
    //   Buffer.alloc(85, 1),
    //   Buffer.alloc(10, 1),
    //   Buffer.alloc(10, 1),
    //   Buffer.alloc(10, 1),
    //   Buffer.alloc(20, 1)
    // ];
    // buffer[0].writeUInt32LE(packetSizes[0], 0);
    // buffer[4].writeUInt32LE(packetSizes[1], 5);
    // buffer[5].writeUInt32LE(packetSizes[2], 41);
    // buffer[5].writeUInt32LE(packetSizes[3], 75);
    // this._s = Observable.from(buffer).map((buf) => Observable.of(buf).delay(100)).concatAll().share();