class RingBuffer {
  /* 
    Create's a Ring Buffer backed by a correctly sized SAB.
    
    There can only be one writer and one reader.
  */
  static create(length) {
    const buffer = new SharedArrayBuffer(
      length + Uint32Array.BYTES_PER_ELEMENT * RingBuffer.HEADER_LENGTH
    );
    const header = new Uint32Array(buffer, 0, RingBuffer.HEADER_LENGTH);
    const body = new Uint8Array(buffer, RingBuffer.HEADER_LENGTH, length);
    header.set([0 /* readIndex */, 0 /* writeIndex */], 0);

    return new RingBuffer(buffer);
  }

  static from(sab) {
    return new RingBuffer(buffer);
  }

  constructor(sab) {
    if (!!sab == false) throw new Error("Shared Array Buffer is undefined");
    if (sab instanceof SharedArrayBuffer == false)
      throw new Error("Parameter 0 is not a Shared Array Buffer");

    this._length =
      sab.byteLength - Uint32Array.BYTES_PER_ELEMENT * RingBuffer.HEADER_LENGTH;
    this._sab = sab;
    this._header = new Uint32Array(sab, 0, RingBuffer.HEADER_LENGTH);
    this._body = new Uint8Array(sab, Uint32Array.BYTES_PER_ELEMENT * RingBuffer.HEADER_LENGTH, this._length);

    this._readIndex = Atomics.load(this._header, RingBuffer.HEADER.READ);
    this._writeIndex = Atomics.load(this._header, RingBuffer.HEADER.WRITE);
  }

  append(data) {
    for (const byte of data) {
      const writeIndex = Atomics.load(this._header, RingBuffer.HEADER.WRITE);
      console.log(writeIndex, byte);

      Atomics.store(this._body, writeIndex, byte);

      this._writeIndex = Atomics.add(this._header, RingBuffer.HEADER.WRITE, 1);

      if (this._writeIndex == this._length - 1) {
        console.log("wrap");
        this._writeIndex = Atomics.store(
          this._header,
          RingBuffer.HEADER.WRITE,
          0
        );
      }
    }
  }

  // Reads the next byte of data
  read() {
    const readIndex = Atomics.load(this._header, RingBuffer.HEADER.READ);
    const writeIndex = Atomics.load(this._header, RingBuffer.HEADER.WRITE);

    if (readIndex == writeIndex) return undefined;

    const value = Atomics.load(this._body, readIndex);

    this._readIndex = Atomics.add(this._header, RingBuffer.HEADER.READ, 1);
    
    if (this._readIndex == this._length) {
      this._readIndex = Atomics.add(this._header, RingBuffer.HEADER.READ, 1);
    }

    return value;
  }

  readToHead() {
    const readIndex = Atomics.load(this._header, RingBuffer.HEADER.READ);
    const writeIndex = Atomics.load(this._header, RingBuffer.HEADER.WRITE);
    
    let data;
    
    if ( writeIndex > readIndex) {    
      data = this._body.subarray(readIndex, writeIndex);
    } else {
      // Data has wrapped around the circular buffer.
      data = 
    }
    
    this._readIndex = Atomics.store(this._header, RingBuffer.HEADER.READ, writeIndex);
    
    return data;
  }

  clear() {
    this._readIndex = Atomics.store(this._header, RingBuffer.HEADER.READ, 0);
    this._writeIndex = Atomics.store(this._header, RingBuffer.HEADER.WRITE, 0);
  }

  debug() {
    console.log(this._sab);
    console.log(this._header);
    console.log(this._body);
  }
}

RingBuffer.HEADER = {
  READ: 0,
  WRITE: 1,
  READING: 2,
  WRITING: 4
};

RingBuffer.HEADER_LENGTH = Object.keys(RingBuffer.HEADER).length;

const rb = RingBuffer.create(10);

rb.append([1, 2, 3, 4]);

rb.debug();
