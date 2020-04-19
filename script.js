import RingBuffer from "./ringbuffer.js";

const randGen = function*(maxItems = 10) {
  const randMax = Math.floor(Math.random() * maxItems);
  for (let i = 0; i <= randMax; i++) {
    yield Math.floor(Math.random() * 100);
  }
};

const gen = function*(maxItems = 10) {
  for (let i = 0; i < maxItems; i++) {
    yield Math.floor(Math.random() * 100);
  }
};

// Append Error test
const rbError = RingBuffer.create(5);
rbError.append([...gen(3)])

try {
  rbError.append([...gen(3)])
} catch (err) {
  console.log('Expected exception.')
}

const rbFillMax = RingBuffer.create(5);
rbFillMax.append([...gen(3)])

try {
  const remaining = rbFillMax.append([...gen(10)], true);
  console.assert(remaining.length == 8, 'Not the correct number of elements remaining')
} catch (err) {
  console.error(err)
}
/*
// Worker test
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
*/