import 'regenerator-runtime/runtime';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Big from 'big.js';
import Form from './components/Form';
import SignIn from './components/SignIn';
import Messages from './components/Messages';

const SUGGESTED_DONATION = '0';
const BOATLOAD_OF_GAS = Big(3).times(10 ** 13).toFixed();

const App = ({ contract, currentUser, nearConfig, wallet }) => {
  const [messages, setDonates] = useState([]);
  const [topdonates, setTopDonates] = useState([]);
  const [donateBalance, setdonateBalance] = useState([]);
  const [numberPhilanthropists, setNumberPhilanthropists] = useState([]);

  useEffect(() => {
    // TODO: don't just fetch once; subscribe!
    contract.getDonates().then(setDonates);
    contract.getTopPhilanthropists().then(setTopDonates);
  }, []);

  contract.getDonateBalance().then(d => {
    setdonateBalance(Math.round(d / 1000000000000000000000000));
  });

  contract.getNumberPhilanthropists().then(n => {
    setNumberPhilanthropists(n);
  });


  const onSubmit = (e) => {
    e.preventDefault();

    const { fieldset, message, username, donation } = e.target.elements;

    fieldset.disabled = true;

    // TODO: optimistically update page with new message,
    // update blockchain data in background
    // add uuid to each message, so we know which one is already known
    contract.addDonate(
      { text: message.value, name: username.value },
      BOATLOAD_OF_GAS,
      Big(donation.value || '0').times(10 ** 24).toFixed()
    ).then(() => {
      contract.getDonates().then(messages => {
        setDonates(messages);
        message.value = '';
        donation.value = SUGGESTED_DONATION;
        fieldset.disabled = false;
        message.focus();
      });
      contract.getTopPhilanthropists().then(topdonates => {
        setDonates(topdonates);
        message.value = '';
        donation.value = SUGGESTED_DONATION;
        fieldset.disabled = false;
        message.focus();
      });
    });
  };

  const signIn = () => {
    wallet.requestSignIn(
      { contractId: nearConfig.contractName, methodNames: [contract.addDonate.name] }, //contract requesting access
      'NEAR Donates', //optional name
      null, //optional URL to redirect to if the sign in was successful
      null //optional URL to redirect to if the sign in was NOT successful
    );
  };

  const signOut = () => {
    wallet.signOut();
    window.location.replace(window.location.origin + window.location.pathname);
  };

  return (
    <main>
      <header>
        <h1>NEAR Donate</h1>
        {currentUser
          ? <button onClick={signOut}>Log out</button>
          : <button onClick={signIn}>Log in</button>
        }
      </header>
      <ul>
        <li><span>Funds raised:</span><strong>{donateBalance}</strong></li>
        <li><span>Number of philanthropists:</span><strong>{numberPhilanthropists}</strong> </li>
      </ul>
      {currentUser
        ? <Form onSubmit={onSubmit} currentUser={currentUser} />
        : <SignIn />
      }

      <h2>Top Philanthropists</h2>
      <Messages messages={topdonates} />

      <h2>Last donates</h2>
      <Messages messages={messages.reverse()} />
    </main>
  );
};

App.propTypes = {
  contract: PropTypes.shape({
    addDonate: PropTypes.func.isRequired,
    getDonates: PropTypes.func.isRequired
  }).isRequired,
  currentUser: PropTypes.shape({
    accountId: PropTypes.string.isRequired,
    balance: PropTypes.string.isRequired
  }),
  nearConfig: PropTypes.shape({
    contractName: PropTypes.string.isRequired
  }).isRequired,
  wallet: PropTypes.shape({
    requestSignIn: PropTypes.func.isRequired,
    signOut: PropTypes.func.isRequired
  }).isRequired
};

export default App;
