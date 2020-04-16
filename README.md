Ring Buffer using a Shared Array Buffer
=======================================

I needed to communicate between a window and a worker, where the worker wouldn't have enough time
to process incoming messages (there was 100% utilisation via a WASM app in the worker).

Shared Array Buffers (SAB) allow a window and workers to share a region of memory, but that memory can is
a fixed size that is defined at the creation time of the SAB

Usage
=====

## Create a Ring Buffer

```
const rb = RingBuffer.create(1024)
```

This creates a Ring Buffer of length 1024 bytes (and some header information)

## Re-initalize a Ring Buffer

We can't pass class over post message, so we have to re-initialieze the Ring Buffer from a SAB.

```
const rb = RingBuffer.from(sab)
```

## Access the Raw Buffer

```
const rb = RingBuffer.create(1024)

rb.buffer
```

## Appebd Data to an Ring Buffer

```
const rb = RingBuffer.create(1024)

rb.append([1,2,3,4])
```

The Ring Buffer will contain 1,2,3,4

### Read a byte of data from Ring Buffer

```
const rb = RingBuffer.create(1024)

rb.append([1,2,3,4])
const byte = rb.read() // 1
const nextByte = rb.read() // 2
```

Reads a byte of data from the Ring Buffer, and advances the internal pointer to the next entry.

### Read all the remaining bytes in the Ring Buffer

`readToHead()` is a generator that returns an itterator.


```
const rb = RingBuffer.create(1024)

rb.append([1,2,3,4])
const byte = rb.read() // 1
const bytes = [...rb.readToHead()] // [2, 3, 4]
```

### Clear the Ring Buffer

```
const rb = RingBuffer.create(1024)

rb.append([1,2,3,4])
rb.clear()
const byte = rb.read() // undefined
```

