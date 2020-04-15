import RingBuffer from "./ringbuffer.js";


const randGen = (maxItems) => {
  const ar = new Array(Math.rand() * maxItems)
  return 
}

const rb = RingBuffer.create(20);

const worker = new Worker("worker.js", {
  type: "module"
});


worker.postMessage(rb.buffer);

setTimeout(() => rb.append([1, 2, 3, 4]);

rb.debug();