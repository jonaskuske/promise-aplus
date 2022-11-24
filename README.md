# A+ compliant promise implementation

<a href="https://promisesaplus.com/">
    <img src="https://promisesaplus.com/assets/logo-small.png" alt="Promises/A+ logo"
         title="Promises/A+ 1.1 compliant" align="right" />
</a>

A Promise implementation that utilizes modern ES2022 features like private class fields and fully complies with the [Promises/A+ 1.1.0 specification](https://promisesaplus.com/). Requires a runtime with `queueMicrotask` like browsers or Node.

### Available functions

```js
// Create new Promise that immediately resolves
promise = Promise.resolve(valueOrThenable)

// Create new Promise that immediately rejects
promise = Promise.reject(reason)

// Create new Promise, must pass executor functiom
promise = new Promise((resolve, reject) => {})

// Return new Promises with resolve/reject handlers applied
promise.then(onResolve, onReject)
promise.catch(onReject)
```

### Example

```js
import { Promise } from "./promise.js"

function retryIfEmpty(fn, retry = 1, signal) {
	retry = Math.max(0, retry)

	const end = new (class extends Error {
		name = "RetryError"
		message = "maximum tries reached"
	})()

	return new Promise((resolve, reject) => {
		signal?.throwIfAborted()
		signal?.addEventListener("abort", reject)

		Promise.resolve(fn()).then((val) => {
			resolve(
				val ?? (retry > 0 ? retryIfEmpty(fn, --retry, signal) : Promise.reject(end)),
			)
		}, reject)
	})
}

retryIfEmpty(() => Math.random() > 0.5 || null, 2).catch((e) => {
	if (e.name !== "RetryError") throw e
	return false
})
```

### Verify

**`yarn test`**: Run A+ test suite against this Promise implementation

**`yarn test-builtin`**: Run A+ test suite against the native built-in `Promise`

**`yarn test-deferred`**: Run deferred tests and A+ test suite against `DeferredPromise`

<br>

---

<br>

©️ 2022, Jonas Kuske
