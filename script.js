import RingBuffer from "./ringbuffer.js";

const randGen = function*(maxItems = 10) {
  const randMax = Math.floor(Math.random() * maxItems);
  for (let i = 0; i <= randMax; i++) {
    yield Math.floor(Math.random() * 100);
  }
};

const rb = RingBuffer.create(50);

const worker = new Worker("worker.js", {
  type: "module"
});

worker.postMessage(rb.buffer);

setInterval(() => {
  const items = [...randGen(20)]
  console.log('setting sab from main thread', items)
  rb.append(items)
}, 500);

rb.debug();
