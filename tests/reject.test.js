import expect from "node:assert"
import { describe, it } from "node:test"
import { DeferredPromise } from "../index.js"

describe("reject", () => {
	it("can be rejected without any reason", async () => {
		const promise = new DeferredPromise().catch(() => {})
		expect.strictEqual(promise.state, "pending")

		promise.reject()

		expect.strictEqual(promise.state, "pending")
		expect.strictEqual(await promise, undefined)
		expect.strictEqual(promise.state, "rejected")
		expect.strictEqual(promise.rejectionReason, undefined)
	})

	it("rejects initial promise without chain", async () => {
		const p = new DeferredPromise()
		try {
			p.reject(1)
			await p
		} catch {
			/* */
		}
		expect.strictEqual(p.rejectionReason, 1)
	})

	it("can be rejected with a reason", async () => {
		const promise = new DeferredPromise().catch((reason) => reason)
		expect.strictEqual(promise.state, "pending")

		const reason = new Error("hello")
		promise.reject(reason)

		expect.strictEqual(promise.state, "pending")
		expect.strictEqual(await promise, reason)
		expect.strictEqual(promise.state, "rejected")
		expect.strictEqual(promise.rejectionReason, reason)
	})

	it("rejects with undefined reason if there is an empty catch block", async () => {
		const promise = new DeferredPromise().catch(() => {
			// Note how this catch block will lose any rejection reason.
		})
		expect.strictEqual(promise.state, "pending")

		const reason = new Error("hello")
		promise.reject(reason)

		expect.strictEqual(promise.state, "pending")
		expect.strictEqual(await promise, undefined)
		// The state still remains as rejected.
		expect.strictEqual(promise.state, "rejected")
		// But the rejection reason is undefined
		// because the "catch" block above didn't return any.
		expect.strictEqual(promise.rejectionReason, undefined)
	})
})
