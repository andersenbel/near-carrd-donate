import { context, u128 } from 'near-sdk-as';
import { Donates, messages } from './model';


// --- contract code goes below

// The maximum number of latest messages the contract returns.
const DONATE_LIST_LIMIT = 10;

// The maximum number of latest messages the contract returns.
const TOP_DONATE_LIST_LIMIT = 5;

/**
 * Adds a new message under the name of the sender's account id.\
 * NOTE: This is a change method. Which means it will modify the state.\
 * But right now we don't distinguish them with annotations yet.
 */
export function addDonate(text: string, name: string): void {
  // Creating a new message and populating fields with our data
  const message = new Donates(text, name);
  // Adding the message to end of the persistent collection
  messages.push(message);
}

/**
 * Returns an array of last N messages.\
 * NOTE: This is a view method. Which means it should NOT modify the state.
 */
export function getDonates(): Donates[] {
  const numMessages = min(DONATE_LIST_LIMIT, messages.length);
  const startIndex = messages.length - numMessages;
  const result = new Array<Donates>(numMessages);
  for (let i = 0; i < numMessages; i++) {
    result[i] = messages[i + startIndex];
  }
  return result;
}

export function getDonateBalance(): String {
  const result = context.accountBalance.toString()
  return result;
}

export function getNumberPhilanthropists(): String {
  const result = messages.length.toString()
  return result;
}

export function getTopPhilanthropists(): Donates[] {
  let min_amount = 0
  const numMessages = messages.length
  let result = new Array<Donates>();
  let result2 = new Array<Donates>(numMessages);
  for (let i = 0; i < numMessages; i++) {
    if (messages[i].amount) {
      //if (messages[i].amount > u128.from(minAmount)) {
      let ind = 0
      while (ind < messages.length && messages[i].amount < messages[ind].amount) {
        ind++;
      }
      result2 = result.splice(0, ind).concat([messages[i]]).concat(result.splice(ind))
      result = result2
      if (messages.length > TOP_DONATE_LIST_LIMIT) {
        result = result2.splice(0, TOP_DONATE_LIST_LIMIT)
      } else {
        result = result2
      }
    }
  }
  return result
}