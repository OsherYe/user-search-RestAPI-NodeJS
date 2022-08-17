const data = require('../data');

module.exports = {
    getUserById: async function(id) {
        console.log(`getUserById called with id: ${id}`);
        // Add implementation here
        id = id.toLowerCase();
        return data.getUserByID(id);
    },

    getUsersByAge: async function(age) {
        console.log(`getUsersByAge called with age: ${age}`);
        // Add implementation here
        return data.getUsersByAGE(age);
    },

    getUsersByCountry: async function(country) {
        console.log(`getUsersByCountry called with country: ${country}`);
        // Add implementation here
        country = country.toLowerCase();
        return data.getUsersByCOUNTRY(country);  
    },

    getUsersByName: async function(name) {
        console.log(`searchUsersByName called with name: ${name}`);
        // Add implementation here
        name = name.toLowerCase();
        return data.getUsersByNAME(name);
    },

    deleteUser: async function(id) {
        console.log(`deleteUser called with id: ${id}`);
        // Add implementation here
        id = id.toLowerCase();
        return data.deleteUser(id);
    }
}