import RingBuffer from './ringbuffer.js'

onmessage = (event) => {
  const rb = RingBuffer.from(event.data);
  
  let char;
  let count = 0;
  while(rb.eof === false) {
    char = rb.blockingRead()
    count++;
    if (count % 10000 == 0) {
      console.log(name, `read: ${count}`)
    }
  }
  console.log(name, 'done', count)
}