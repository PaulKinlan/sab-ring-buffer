# Ring Buffer using a Shared Array Buffer

I needed to communicate between a window and a worker, where the worker wouldn't have enough time
to process incoming messages (there was 100% utilisation via a WASM app in the worker).

Shared Array Buffers (SAB) allow a window and workers to share a region of memory, but that memory can is
a fixed size that is defined at the creation time of the SAB

# Usage

## Create a Ring Buffer

`RingBuffer.create(byteCount)` is a static method that creates a Ring Buffer of length 1024 bytes (and some header information)

```
const rb = RingBuffer.create(1024)
```

## Re-initalize a Ring Buffer

`RingBuffer.from(sab)` is a static method to initialize a new instance of RingBuffer from an existing SAB. This is needed because it's impossible to pass the class over postMessage

```
onst rb1 = RingBuffer.create(1024)

const rb2 = RingBuffer.from(rb1.buffer)
```

## Access the Raw Buffer

`buffer` will give you access to the raw Shared Array Buffer. It is not intended for general use.

```
const rb = RingBuffer.create(1024)

rb.buffer
```

## Appebd Data to an Ring Buffer

`append(array)` adds data into the buffer. If there are more entries to append that space, an exception is thrown.

```
const rb = RingBuffer.create(1024)

rb.append([1,2,3,4])
```

The Ring Buffer will contain 1,2,3,4

### Read a byte of data from Ring Buffer

`read()` reads a byte of data from the Ring Buffer, and advances the internal pointer to the next entry. Returns `undefined` when there are no more entries to read.

```
const rb = RingBuffer.create(1024)
rb.append([1,2,3,4])

const byte = rb.read() // 1
const nextByte = rb.read() // 2
```

### Read all the remaining bytes in the Ring Buffer

`readToHead()` is a generator that returns an itterator of the bytes that have not yet been read from the buffer.

```
const rb = RingBuffer.create(1024)
rb.append([1,2,3,4])

const byte = rb.read() // 1
const bytes = [...rb.readToHead()] // [2, 3, 4]
```

### Clear the Ring Buffer

`clear()` will reset the internal readIndex and writeIndex, effectively emptying the Buffer.

```
const rb = RingBuffer.create(1024)
rb.append([1,2,3,4])

rb.clear()
const byte = rb.read() // undefined
```
