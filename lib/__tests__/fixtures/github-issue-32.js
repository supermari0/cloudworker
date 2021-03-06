addEventListener("fetch", event => {
  event.respondWith(fetchAndStream(event.request))
})

async function fetchAndStream(request) {
  // Fetch from origin server.
  let response = await fetch("http://www.google.com/robots.txt")

  // Create an identity TransformStream (a.k.a. a pipe).
  // The readable side will become our new response body.
  let { readable, writable } = new TransformStream()

  // Start pumping the body. NOTE: No await!
  streamBody(response.body, writable)

  // ... and deliver our Response while that's running.
  return new Response(readable, response)
}

async function streamBody(readable, writable) {
  let reader = readable.getReader({mode: "byob"})
  let writer = writable.getWriter()

  while (true) {
    const { done, value } = await reader.read(new Uint8Array(1024))
    if (done) {
      await writer.write(value)
      break
    }
    // Optionally transform value's bytes here.
    await writer.write(value)
  }

  await writer.close()
}