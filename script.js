import RingBuffer from "./ringbuffer.js";


const randGen = (maxItems = 10) => {
  const ar = new Array(Math.ceil(Math.random() * maxItems));
  return ar.map(_ => Math.ceil(Math.random() * 100));
}

const rb = RingBuffer.create(20);

const worker = new Worker("worker.js", {
  type: "module"
});


worker.postMessage(rb.buffer);

setInterval(() => rb.append(randGen(20)),1000);

rb.debug();