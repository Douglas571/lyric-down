const path = require('path')
const fs = require('fs')

const crypto = require('crypto')

let res = crypto.createHash("sha256")
  				.update("Man oh man do I love node!")
  				.digest("hex");

console.log(res)

const secret = 'cats'
const msg = "If you love node so much why don't you marry it?"

res = crypto.createHmac("sha256", secret)
			  .update(msg)
			  .digest("hex");