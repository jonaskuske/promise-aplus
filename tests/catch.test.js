import expect from "node:assert"
import { describe, it, mock } from "node:test"
import { DeferredPromise } from "../index.js"

describe("catch", () => {
	it('can be listened to with "catch"', async () => {
		const catchCallback = mock.fn((arg) => {
			expect.strictEqual(arg, "error")
		})
		const promise = new DeferredPromise().catch(catchCallback)

		promise.reject("error")

		expect.strictEqual(await promise, undefined)
		expect.strictEqual(promise.state, "rejected")
	})

	it("propagates a caught error to derived promises", async () => {
		const p1 = new DeferredPromise()
		const p2 = p1.catch((error) => error)

		p1.reject("hello")

		expect.strictEqual(await p2, "hello")
	})

	it('allows chaining "then" after "catch"', async () => {
		const promise = new DeferredPromise()
			.catch((value) => {
				if (typeof value === "number") {
					return value
				}
			})
			.then((value) => {
				if (typeof value === "number") {
					return value + 10
				}
			})

		promise.reject(5)

		expect.strictEqual(await promise, 15)
	})

	it("supports complex then/catch chains", async () => {
		const promise = new DeferredPromise()
			.then((x) => {
				return x + 5
			})
			.then((x) => {
				throw new Error(`${x} apples`)
			})
			.catch((error) => {
				if (error instanceof Error) {
					return error.message.toUpperCase()
				}

				throw error
			})
			.then((message) => {
				if (typeof message === "string") {
					return message.split(" ")
				}
			})
			.catch(() => {
				throw new Error("Must never reach this")
			})

		promise.resolve(5)

		expect.deepStrictEqual(await promise, ["10", "APPLES"])
	})

	it('supports a Promise returned from "catch"', async () => {
		const promise = new DeferredPromise().catch((x) => {
			return new Promise((resolve) => {
				resolve(x.toString())
			})
		})

		promise.reject(123)

		expect.strictEqual(await promise, "123")
	})

	it('supports a DeferredPromise returned from "catch"', async () => {
		const promise = new DeferredPromise().catch((x) => {
			const deferred = new DeferredPromise()
			deferred.resolve(x.toString())
			return deferred
		})

		promise.reject(123)

		expect.strictEqual(await promise, "123")
	})
})
