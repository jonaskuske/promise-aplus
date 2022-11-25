import assert from "node:assert"
import test from "node:test"
import { Promise } from "../../promise.js"

test("called when Promise fulfills", async (t) => {
	const onFinally = t.mock.fn()

	await Promise.resolve().finally(onFinally)

	assert.strictEqual(onFinally.mock.callCount(), 1)
})

test("called when Promise rejects", async (t) => {
	const onFinally = t.mock.fn()

	try {
		await Promise.reject().finally(onFinally)
	} catch {
		/**/
	}

	assert.strictEqual(onFinally.mock.callCount(), 1)
})

test("receives no arguments", async (t) => {
	const onFinally = t.mock.fn((...args) => {
		assert.strictEqual(args.length, 0)
	})

	await Promise.resolve().finally(onFinally)

	assert.strictEqual(onFinally.mock.callCount(), 1)
})

test("returns a new Promise instance", async () => {
	const a = Promise.resolve()
	const b = a.finally()

	assert.notStrictEqual(a, b)
	assert(b instanceof Promise)
})

test("chains the original value through", async () => {
	const value = await Promise.resolve(1).finally(() => 2)
	assert.strictEqual(value, 1)
})

test("chains the original reject reason through", async () => {
	try {
		await Promise.reject(1).finally(() => 2)

		assert.fail("mustn't reach this line")
	} catch (reason) {
		assert.strictEqual(reason, 1)
	}
})

test("rejects if onFinally throws", async () => {
	try {
		await Promise.resolve().finally(() => {
			throw 1
		})

		assert.fail("mustn't reach this line")
	} catch (reason) {
		assert.strictEqual(reason, 1)
	}
})

test("rejects if onFinally returns rejected Promise", async () => {
	try {
		await Promise.resolve().finally(() => Promise.reject(1))

		assert.fail("mustn't reach this line")
	} catch (reason) {
		assert.strictEqual(reason, 1)
	}
})
