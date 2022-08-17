const csv = require('csv-parser') // module
const fs = require('fs');   // file stream
const { type } = require('os');
const { mainModule } = require('process');
const trie = require("trie-search"); //for partial names. 

//Store users by different keys in map. Faster Search then linear time.
const IdMap = new Map();
const countryMap = new Map();
const nameMap = new Map();
const birthdayMap = new Map();
const trieMap = new trie();

// Parse from CSV. For..in loop - for each user, we add the user as value to all kinds of maps we have.
// while the key is changing so we can GET the user fast.
fs.createReadStream('data.csv')
  .pipe(csv({ mapHeaders: ({ header }) => header.toLowerCase() }))
  .on('data', async(user) => {
    await initAll(user);
    })
    .on('end', () => {
      console.log("Connected");
    });

async function initAll(user){
  addToIdMap(user);
  addToCountryMap(user);
  addToNameMap(user);
  addToAgeMap(user);
  addToTrie(user);
}
    
//GET METHODS
function getUserByID(id){
  const ans = IdMap.get(id);
  return ans ? ans : "Doesn't Exist";
}

function getUsersByCOUNTRY(country) {
  const ans = countryMap.get(country);
  return ans? [...ans.values()] : "Doesn't Exist";
}

function getUsersByNAME(name) {
  let ans = [];
  const separatedNames = name.split(' ').filter(name => name.length > 0);
  if (separatedNames.length <= 2) {
      if (separatedNames.length === 2) {
          const fullName = separatedNames.join(' ');
          ans = nameMap.get(fullName);
      } else if(separatedNames.length === 1) {
          const [partialName] = separatedNames;
          if (nameMap.has(partialName)) {
              ans = nameMap.get(partialName);
          } else if( partialName.length >= 3 ) {
              ans = trieMap.search(name); 
          }
      }
  }  
  return ans? [...ans.values()] : "Doesn't Exist";
}

function getUsersByAGE(age) {
  const year = new Date().getFullYear() - age;
  const yearStr = year.toString();
  const ans = birthdayMap.get(yearStr);
  return ans ? [...ans.values()] : "Doesn't Exist"
}

//ADD METHODS
function addToIdMap(user) {
  IdMap.set(user.id,user);
}

function addToCountryMap(user) {
  const country = user.country.toLowerCase();
  if (!countryMap.has(country)) {
    countryMap.set(country, new Map());
  }
  countryMap.get(country).set(user.id,user);
}

function addToAgeMap(user) {
  const birthday = user.dob;
  const birthdayDate = birthday.split('/');
  const year = birthdayDate[2];
  if(!birthdayMap.has(year)) {
    birthdayMap.set(year, new Map());
  }
  birthdayMap.get(year).set(user.id, user);
}

// function calcAge(user.dob) {
//   var today = new Date();
//   var birthDate = new Date(dateString);
//   var age = today.getFullYear() - birthDate.getFullYear();
//   var m = today.getMonth() - birthDate.getMonth();
//   if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
//       age--;
//   }
//   return age;
// }

function addToNameMap(user) {
  const fullName = user.name.toLowerCase();   
  const separated = fullName.split(' ').filter(name => name.length > 0);
  addToNameFullMap(user, fullName, separated);
}

function addToTrie(user) {
  trieMap.map(user.name, user);
}

function addToNameFullMap(user ,fullName, sepNames) {
  addNewMap(nameMap, fullName);
  nameMap.get(fullName).set(user.id,user);
  
  const [firstName, lastName] = sepNames;
  addNewMap(nameMap,firstName);
  nameMap.get(firstName).set(user.id,user);
  
  if (firstName != lastName){
      addNewMap(nameMap, lastName);
      nameMap.get(lastName).set(user.id,user);
  }
}

function addNewMap(map, inputName) {
  if (!map.has(inputName)) {
      map.set(inputName, new Map());
  }
}
//DELETE METHODS
function deleteUser(id) {
  const user = IdMap.get(id);
  if (user) {
      const {name,birthday,country} = user;
      deleteByID(id);
      deleteByCountry(id, country.toLowerCase());
      deleteByNames(id,name.toLowerCase());
      deleteByDateOfBirth(id, birthday);
      console.log("User Deleted")
  } else {
    console.log("No such id, please check again.")
  }
}

function deleteByCountry(id, country) {
  const countryList = countryMap.get(country)
  if (countryList) {
      countryList.delete(id);
  }
}

function deleteByID(id) {
  IdMap.delete(id);
}

function deleteByNames(id, fullName) {
  const nameList = nameMap.get(fullName)
  if(nameList){
    nameList.delete(id)
  }
}

function deleteByDateOfBirth(id, dob) {
  if(typeof dob === 'string') {
    const birthday = dob.split('/');
    const year = birthday[2];
    const yearList = birthdayMap.get(year);
    yearList.delete(id);
  }
}

module.exports = {
  getUserByID,
  getUsersByCOUNTRY,
  getUsersByNAME,
  getUsersByAGE,
  deleteUser
}