import expect from "node:assert"
import { describe, it } from "node:test"
import { DeferredPromise } from "../../index.js"

describe("then", async () => {
	it("respects promise identity with chain transforms", async () => {
		const p1 = new DeferredPromise()
		const p2 = p1.then(function add(x) {
			return x + 2
		})
		p1.resolve(5)

		expect.strictEqual(await p1, 5)
		expect.strictEqual(await p2, 7)
	})

	it("supports value transform via chaining", async () => {
		const p1 = new DeferredPromise()
			.then(function add(x) {
				return x + 2
			})
			.then(function multiply(x) {
				return x * 2
			})

		p1.resolve(5)
		expect.strictEqual(await p1, 14)
	})

	it("supports two independent transform chains", async () => {
		const p1 = new DeferredPromise().then((x) => x + 2)
		const p2 = p1.then((x) => x + 5)

		p1.resolve(5)

		expect.strictEqual(await p1, 7)
		expect.strictEqual(await p2, 12)
	})

	it('supports a Promise returned from "then"', async () => {
		const promise = new DeferredPromise().then((x) => {
			return new Promise((resolve) => {
				resolve(x.toString())
			})
		})

		promise.resolve(5)

		expect.strictEqual(await promise, "5")
	})

	it('supports a DeferredPromise returned from "then"', async () => {
		const promise = new DeferredPromise().then((x) => {
			const deferred = new DeferredPromise()
			deferred.resolve(x.toString())
			return deferred
		})

		promise.resolve(5)

		expect.strictEqual(await promise, "5")
	})
})
