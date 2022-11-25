import expect from "node:assert"
import { describe, it, mock } from "node:test"
import { DeferredPromise } from "../../index.js"

describe("finally", () => {
	it('executes the "finally" block when the promise resolves', async () => {
		const promise = new DeferredPromise()
		const spy = mock.fn((arg) => {
			expect.strictEqual(arg, undefined)
		})
		promise.finally(spy)

		// Promise is still pending.
		expect.strictEqual(spy.mock.callCount(), 0)

		promise.resolve()
		expect.strictEqual(spy.mock.callCount(), 0)

		await promise

		expect.strictEqual(spy.mock.callCount(), 1)
	})

	it('executes the "finally" block when the promise rejects', async () => {
		const promise = new DeferredPromise().catch(() => {})

		const spy = mock.fn((arg) => {
			expect.strictEqual(arg, undefined)
		})
		promise.finally(spy)

		// Promise is still pending.
		expect.strictEqual(spy.mock.callCount(), 0)

		promise.reject()
		await promise

		expect.strictEqual(spy.mock.callCount(), 1)
	})

	it('does not alter resolved data with ".finally()"', async () => {
		const promise = new DeferredPromise()

		const spy = mock.fn((arg) => {
			expect.strictEqual(arg, undefined)
			return "unexpected"
		})
		const wrapper = () => promise.finally(spy)

		promise.resolve(123)
		const result = await wrapper()

		expect.strictEqual(result, 123)
		expect.strictEqual(spy.mock.callCount(), 1)
	})
})
