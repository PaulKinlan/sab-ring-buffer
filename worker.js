import RingBuffer from './ringbuffer.js'

onmessage = (event) => {
  const rb = RingBuffer.from(event.data);
  
  setInterval(()=>console.log([...rb.readToHead()]), 1000)
  
}