
async function AuthenUser(acc, name , pass )  {
	var authen = false
	if (name==acc.Name && pass==acc.Pass) {
		authen = true
	}
	return authen
}

async function AuthorUser(req, arrRole) {
	var author = false
	var session = req.session
	var irole = session.role

	if (irole != null) {
		var role = irole
        for (var r of arrRole) {
			if (role == r) {
				author = true
				break
			}
		}
	}
	return author
}

module.exports = {AuthenUser, AuthorUser};
