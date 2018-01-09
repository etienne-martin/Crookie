const fetch = require('node-fetch');
const get = require('lodash/get');
const config = require('./config');

async function fetchJSON(url){
  return await (await fetch(url)).json()
}

function compareArrays(arr1, arr2, key){
  const diff = [];

  for (const index in arr2) {
    const value1 = get(arr1[index], key);
    const value2 = get(arr2[index], key);

    if (value1 !== value2 && value2) diff.push(value2);
  }

  return removeDuplicatesFromArray(diff);
}

function compareObject(obj1, obj2){
  const diff = [];

  for (const property in obj2) {
    if (obj1.hasOwnProperty(property) === false) {
      diff.push(property);
    }
  }

  return removeDuplicatesFromArray(diff);
}

async function sendSlackMessage(message){
  const body = {
    text: message
  };

  return await (await fetch(config.webhookUrl, {
    'method': 'POST',
    'body': JSON.stringify(body),
    'content-type': 'application/json'
  })).text() === 'ok';
}

function randomItem(items){
  return items[Math.floor(Math.random()*items.length)];
}

function removeDuplicatesFromArray(array){
  return array.filter(function(item, pos) {
    return array.indexOf(item) === pos;
  });
}

function constructMessage(diffs, exchange, urlConstructor){
  const messages = [];
  const exclamations = [
    'Yay!',
    'Yeah!',
    'Hurrah!',
    'Wee!',
    'Whoa!',
    'Yee-haw!',
    'Woot woot!'
  ];

  // Add the title
  if (diffs.length === 1) {
    messages.push('>*' + randomItem(exclamations) + ' There\'s a new crypto recruit on ' + exchange + '*');
  } else {
    messages.push('>*' + randomItem(exclamations) + ' There are new crypto recruits on ' + exchange + '*');
  }

  // Add a line for each new currencies
  for (const diff of diffs) {
    messages.push('>`' + diff.toUpperCase() + '`: ' + urlConstructor(diff));
  }

  return messages.join('\n');
}

module.exports = {
  fetchJSON,
  compareArrays,
  compareObject,
  sendSlackMessage,
  constructMessage
}