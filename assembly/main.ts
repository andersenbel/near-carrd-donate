import { context, u128 } from 'near-sdk-as';
import { Donation, messages } from './model';


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
  const message = new Donation(text, name);
  // Adding the message to end of the persistent collection
  messages.push(message);
}

/**
 * Returns an array of last N messages.\
 * NOTE: This is a view method. Which means it should NOT modify the state.
 */
export function getDonates(): Donation[] {
  const numMessages = messages.length
  let result = new Array<Donation>();
  for (let i = 0; i < numMessages; i++) {
    if (messages[i].amount > u128.from(0))
      result.push(messages[i]);
    if (result.length == DONATE_LIST_LIMIT)
      break
  }
  return result
}

export function getDonateBalance(): String {
  const result = context.accountBalance.toString()
  return result;
}

export function getNumberPhilanthropists(): String {
  const result = messages.length.toString()
  return result;
}

export function getTopPhilanthropists(): Array<Donation> {
  const numMessages = messages.length
  let result: Array<Donation> = [];
  for (let i = 0; i < numMessages; i++) {
    if (result.length == 0)
      result.push(messages[i])
    else if (messages[i].amount && messages[i].amount > u128.from(0)) {
      result = insert_and_sort(result, messages[i])
    }
  }
  return result.splice(0, TOP_DONATE_LIST_LIMIT)
}

function insert_and_sort(result: Array<Donation>, donation: Donation): Array<Donation> {
  let to_break = false
  let i = 0
  const new_result: Array<Donation> = [];
  while (i < result.length) {
    if (donation.amount >= result[i].amount && !to_break) {
      to_break = true
      new_result.push(donation)
      new_result.push(result[i])
    } else {
      new_result.push(result[i])
    }
    i++;
  }
  return new_result
}