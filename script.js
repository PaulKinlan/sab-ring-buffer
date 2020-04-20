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
const rb1 = RingBuffer.create(6);
rb1.append([1, 2, 3]);
rb1.append([4, 5]);
const rb1data = [...rb1.readToHead()];
console.assert(rb1data.length == 5, "rb1 not the correct length");
console.assert(rb1data[0] == 1, "rb1[0] not the correct value");

const rb2 = RingBuffer.create(6);
rb2.append([1, 2, 3]);
rb2.append([4, 5, 6]);
const rb2data = [...rb2.readToHead()];
console.assert(rb2data.length == 6, "rb2 not the correct length");
console.assert(rb2data[5] == 6, "rb2[5] not the correct value");

const rb3 = RingBuffer.create(6);
rb3.append([1, 2, 3]);
rb3.append([4, 5]);
let rb3data = [...rb3.readToHead()];
console.assert(rb3data.length == 5, "rb1 not the correct length");
console.assert(rb3data[4] == 5, "rb1 not the correct value");
rb3.append([7, 8, 9]);
rb3data = [...rb3.readToHead()];
console.assert(rb3data.length == 3, "rb1 not the correct length");
console.assert(rb3data[2] == 9, "rb1 not the correct value");

// Append Error test
const rbError = RingBuffer.create(5);
rbError.append([1, 2, 3]);

try {
  rbError.append([4, 5, 6]);
} catch (err) {
  console.log("Expected exception.");
}

const rbFillMax = RingBuffer.create(5);
rbFillMax.append([...gen(3)]);

try {
  const remaining = rbFillMax.append([...gen(10)], true);
  console.assert(
    remaining.length == 8,
    "Not the correct number of elements remaining"
  );
} catch (err) {
  console.error(err);
}

// // Worker test
// const rb = RingBuffer.create(50);

// const worker = new Worker("worker.js", {
//   type: "module"
// });

// worker.postMessage(rb.buffer);

// setInterval(() => {
//   const items = [...randGen(20)]
//   console.log('setting sab from main thread', items)
//   rb.append(items)
// }, 500);

// Blocking Read Worker test. And EOF.
const rbBlocking = RingBuffer.create(50);

const blockingWorkerEOF = new Worker("blocking-worker.js", {
  type: "module"
});

blockingWorkerEOF.postMessage(rbBlocking.buffer);
const items = [...gen(5)];
console.log("Blocking Worker", "EOF. setting sab from main thread", items);
rbBlocking.append(items);

setTimeout(() => {
  rbBlocking.append([1, 2, 3, 4]);
  rbBlocking.eof = true;
}, 2000);
