/*
   Copyright 2020 Google Inc.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

export default class RingBuffer {
  /* 
    Create's a Ring Buffer backed by a correctly sized SAB.
    
    There can only be one writer and one reader.
  */
  static create(length) {
    const buffer = new SharedArrayBuffer(
      length + Uint32Array.BYTES_PER_ELEMENT * HEADER_LENGTH
    );

    return new RingBuffer(buffer);
  }

  static from(sab) {
    return new RingBuffer(sab);
  }

  get buffer() {
    return this._sab;
  }

  get remaining() {
    return this._size - this.length;
  }

  get size() {
    return this._size;
  }

  get length() {
    let readIndex = Atomics.load(this._header, HEADER.READ);
    let writeIndex = Atomics.load(this._header, HEADER.WRITE);

    const delta = writeIndex - readIndex;
    return readIndex <= writeIndex ? delta : delta + this._size;
  }

  constructor(sab) {
    if (!!sab == false) throw new Error("Shared Array Buffer is undefined");
    if (sab instanceof SharedArrayBuffer == false)
      throw new Error("Parameter 0 is not a Shared Array Buffer");

    this._size = sab.byteLength - Uint32Array.BYTES_PER_ELEMENT * HEADER_LENGTH;
    this._sab = sab;
    this._header = new Uint32Array(sab, 0, HEADER_LENGTH);
    this._body = new Uint8Array(
      sab,
      Uint32Array.BYTES_PER_ELEMENT * HEADER_LENGTH,
      this._size
    );
  }

  /*
    data: An array of Uint8
    attemptToFill (deafault: false): if true, will fill as much of the array as possible 
      returning the items that couldn't be added.
    
  */
  append(data, attemptToFill = false) {
    const { remaining, length, size } = this;

    if (data.length > remaining && attemptToFill == false) {
      throw new Error("Data being appeneded will overflow the buffer");
    }

    if (data instanceof Array == false && data instanceof Uint8Array == false) {
      throw new Error(
        "data is not an array that can be converted to Uint8array"
      );
    }

    let readIndex = Atomics.load(this._header, HEADER.READ);
    let writeIndex = Atomics.load(this._header, HEADER.WRITE);
    let writeStart = writeIndex % size; 
  
    // We need at most two write operations.
    // If the data will go past the end of the buffer, we need
    // to write a 2nd batch from the start of the buffer.
    // 9, 15
    // batch1, pos [9] = val [0]
    // batch2, pos [0] = val [1,2,3,4,5]

    const batch1 = data.slice(0, size - writeStart);
    this._body.set(batch1, writeStart);
    let writeLength = batch1.length;

    if (writeLength < data.length) {
      // We are wrapping around because there was more data.
      const batch2 = data.slice(writeLength, remaining - writeLength);
      this._body.set(batch2, 0);
      writeLength += batch2.length;
      
      Atomics.add(this._header, HEADER.WRITE, writeLength);
      
      if (attemptToFill && writeLength < data.length) {
        return data.slice(writeLength);
      } 
    }
    else {
      Atomics.add(this._header, HEADER.WRITE, writeLength);
    }    
  }

  // Reads the next byte of data. Note: Assuming 4GB of addressable buffer.
  read() {
    let readIndex = Atomics.load(this._header, HEADER.READ);
    let writeIndex = Atomics.load(this._header, HEADER.WRITE);

    if (readIndex == writeIndex) return undefined;

    const value = Atomics.load(this._body, readIndex % this._size);

    readIndex = Atomics.add(this._header, HEADER.READ, 1);

    return value;
  }

  *readToHead() {
    // Feels odd to have to create a buffer the same size as the buffer. Just iterate.
    let data;
    while ((data = this.read()) != undefined) {
      yield data;
    }
  }

  clear() {
    Atomics.store(this._header, HEADER.READ, 0);
    Atomics.store(this._header, HEADER.WRITE, 0);
  }

  debug() {
    console.log(this._sab);
    console.log(this._header);
    console.log(this._body);
  }
}

const HEADER = {
  READ: 0, // 4GB buffer
  WRITE: 1, // 4GB buffer
};

const HEADER_LENGTH = Object.keys(HEADER).length;
