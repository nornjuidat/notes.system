const User = require("./user"); // זה ה-model של mongoose

async function findByUsername(username) {
  return await User.findOne({ username }).lean();
}

async function createUser({ username, password_hash }) {
  const user = await User.create({
    username,
    password_hash
  });

  return {
    id: user._id,
    username: user.username,
    created_at: user.created_at
  };
}

module.exports = {
  findByUsername,
  createUser
};
