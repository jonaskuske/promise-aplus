import expect from "node:assert"
import { describe, it } from "node:test"
import { DeferredPromise } from "../../index.js"

describe("resolve", () => {
	it("can be resolved without data", async () => {
		const promise = new DeferredPromise()
		expect.strictEqual(promise.state, "pending")
		promise.resolve()

		expect.strictEqual(promise.state, "pending")
		expect.strictEqual(await promise, undefined)
		expect.strictEqual(promise.state, "fulfilled")
	})

	it("can be resolved with data", async () => {
		const promise = new DeferredPromise()
		expect.strictEqual(promise.state, "pending")

		promise.resolve(123)

		expect.strictEqual(promise.state, "pending")
		expect.strictEqual(await promise, 123)
		expect.strictEqual(promise.state, "fulfilled")
	})

	it("does nothing when resolving an already resolved promise", async () => {
		const promise = new DeferredPromise()
		expect.strictEqual(promise.state, "pending")

		promise.resolve(123)
		expect.strictEqual(promise.state, "pending")
		expect.strictEqual(await promise, 123)
		expect.strictEqual(promise.state, "fulfilled")

		// Resolving an already resolved Promise does nothing.
		promise.resolve(456)
		expect.strictEqual(promise.state, "fulfilled")
		expect.strictEqual(await promise, 123)
	})

	it("throws when resolving an already rejected promise", async () => {
		const promise = new DeferredPromise().catch((error) => error)
		expect.strictEqual(promise.state, "pending")
		promise.reject("first reason")

		await promise

		expect.strictEqual(promise.state, "rejected")
		expect.strictEqual(promise.rejectionReason, "first reason")

		promise.reject("second reason")
		expect.strictEqual(promise.state, "rejected")
		expect.strictEqual(promise.rejectionReason, "first reason")
	})
})
