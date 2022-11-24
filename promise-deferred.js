export class DeferredPromise extends Promise {
	#resolved = false
	#state = "pending"
	#rejectionReason = undefined

	constructor(executor = () => {}) {
		let resolve, reject

		super((res, rej) => executor((resolve = res), (reject = rej)))

		this.resolve = (value) => {
			if (this.#resolved) return resolve(value)
			this.#resolved = true

			return resolve(
				DeferredPromise.resolve(value).then((result) => {
					this.#state = "fulfilled"
					return result
				}),
			)
		}

		this.reject = (reason) => {
			if (this.#resolved) return reject(reason)
			this.#resolved = true

			this.#rejectionReason = reason
			queueMicrotask(() => (this.#state = "rejected"))

			return reject(reason)
		}
	}

	get state() {
		return this.#state
	}
	get rejectionReason() {
		return this.#rejectionReason
	}

	#decorate(promise) {
		return Object.defineProperties(promise, {
			resolve: { value: this.resolve },
			reject: { value: this.reject },
			state: { configurable: true, get: () => this.#state },
			rejectionReason: { configurable: true, get: () => this.#rejectionReason },
		})
	}

	then(...args) {
		return this.#decorate(super.then(...args))
	}
	catch(onReject, ...args) {
		return this.#decorate(
			super.catch((reason) => (this.#rejectionReason = onReject?.(reason)), ...args),
		)
	}
	finally(...args) {
		return this.#decorate(super.finally(...args))
	}
}
