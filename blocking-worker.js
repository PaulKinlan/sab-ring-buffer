import RingBuffer from './ringbuffer.js'

onmessage = (event) => {
  const rb = RingBuffer.from(event.data);
  
  let char;
  while(rb.eof === false) {
    char = rb.blockingRead()
    console.log(Date.now(), char);
  }
  console.log('done')
}