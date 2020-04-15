class RingBuffer {
  /* 
    Create's a Ring Buffer backed by a correctly sized SAB
  */
  static create(length) {
    const buffer = new SharedArrayBuffer(
      length + Uint32Array.BYTES_PER_ELEMENT * 2
    );
    const header = new Uint32Array(buffer, 0, 2);
    const body = new Uint8Array(buffer, Uint32Array.BYTES_PER_ELEMENT * 2);
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

    this._length = sab.length - Uint32Array.BYTES_PER_ELEMENT * 2;
    this._sab = sab;
    this._header = new Uint32Array(sab, 0, 2);
    this._body = new Uint8Array(sab, Uint32Array.BYTES_PER_ELEMENT * 2);

    this._readIndex = Atomics.load(this._header, 0);
    this._writeIndex = Atomics.load(this._header, 1);
  }

  append(data) {
    for (const byte in data) {
      const writeIndex = Atomics.load(this._header, 1);
      console.log(writeIndex, byte)
      
      Atomics.store(this._body, writeIndex, byte);

      this._writeIndex = Atomics.add(this._header, 1, 1);
    }
  }

  // Reads data up until the
  read() {}
  
  debug() {
    console.log(this._sab)
    console.log(this._header);
    console.log(this._body);
  }
}

const rb = RingBuffer.create(1024)

rb.append([1,2,3,4])

rb.debug();