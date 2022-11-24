export class Promise {
	static resolve(value) {
		return new Promise((resolve) => resolve(value))
	}
	static reject(reason) {
		return new Promise((resolve, reject) => reject(reason))
	}

	#state = "pending"
	#value = undefined
	#queue = []

	// Accept an executor function and pass resolve and reject functions
	// as arguments, which will fullfill or reject the promise when called.
	// → new Promise((resolve, reject) => {})
	constructor(executor) {
		// If executor is invalid, call it outside try/catch to throw TypeError
		if (typeof executor !== "function") executor()

		// Must only resolve/reject once, ignore following calls & throws
		let handled = false

		const resolve = (value) => {
			!handled && (handled = true) && queueMicrotask(() => this.#fullfill(value))
		}
		const reject = (reason) => {
			!handled && (handled = true) && queueMicrotask(() => this.#reject(reason))
		}

		try {
			executor(resolve, reject)
		} catch (reason) {
			reject(reason)
		}
	}

	then(onResolved, onRejected) {
		if (typeof onResolved !== "function") onResolved = (x) => x
		if (typeof onRejected !== "function") {
			onRejected = (x) => {
				throw x
			}
		}

		return new Promise((resolve, reject) => {
			const settle = () => {
				try {
					const handler = this.#state === "rejected" ? onRejected : onResolved
					resolve(handler(this.#value))
				} catch (reason) {
					reject(reason)
				}
			}

			// If 'this' promise has already settled, we can start settling the 'next' promise
			// (returned from .then) right away. Mustn't be called sync, so queue as microtask.
			if (this.#state !== "pending") return queueMicrotask(settle)

			// Otherwise we register a callback. Once 'this' promise has settled,
			// it'll run its callbacks so the 'next' promise will start settling too.
			// We unshift so that the promise can pop its queue in chronological order:
			this.#queue.unshift(settle)
		})
	}

	catch(onRejected) {
		return this.then(undefined, onRejected)
	}

	// Recursively unwrap promises until we reach a non-thenable value.
	// Fullfill with this value or reject if something in the chain throws/rejects.
	// → Promise.resolve(Promise.resolve(1)).then(x => x === 1)
	#fullfill(next) {
		if (next === this) {
			return this.#reject(new TypeError(`Chaining cycle detected for promise: ${next}`))
		}

		// If next could be a thenable (object or function), check for a .then method.
		// It could be a getter that throws - catch and reject promise in that case.
		let then
		if (typeof next === "object" || typeof next === "function") {
			try {
				then = next?.then
			} catch (error) {
				return this.#reject(error)
			}
		}

		// If next isn't a thenable, the chain is fully unwrapped to its final value.
		// Settle (change state & set value), then run the queued .then callbacks.
		if (typeof then !== "function") {
			this.#value = next
			this.#state = "fullfilled"

			let callback
			while ((callback = this.#queue.pop())) callback()
		} else {
			// Otherwise, next is a thenable. Unwrap it: add onResolve and onReject callbacks
			// that recursively call #fullfill, which will then check for the next thenable.
			// This continues until a non-thenable is reached.
			let handled = false

			const onResolve = (value) => {
				!handled && (handled = true) && this.#fullfill(value)
			}
			const onReject = (reason) => {
				!handled && (handled = true) && this.#reject(reason)
			}

			try {
				then.call(next, onResolve, onReject)
			} catch (reason) {
				onReject(reason)
			}
		}
	}

	// Rejecting has no unwrapping behavior, so we can settle immediately.
	// → Promise.reject(Promise.resolve(1)).catch(x => x instanceof Promise)
	#reject(reason) {
		this.#value = reason
		this.#state = "rejected"

		let callback
		while ((callback = this.#queue.pop())) callback()
	}
}
