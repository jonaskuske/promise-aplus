process.on("unhandledRejection", () => {})

require = require("esm")(module, { cache: false })
const { DeferredPromise: Promise } = require("./index.js")

module.exports = {
	deferred() {
		let resolve, reject

		const promise = new Promise((res, rej) => {
			resolve = res
			reject = rej
		})

		return { promise, resolve, reject }
	},
}
