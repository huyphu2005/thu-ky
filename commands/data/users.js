// data/users.js

const users = new Map();

function getUser(id) {
    if (!users.has(id)) {
        users.set(id, {
            money: 1000,
            lastDaily: 0,
            lastWork: 0
        });
    }

    return users.get(id);
}

module.exports = {
    getUser,
    users
};