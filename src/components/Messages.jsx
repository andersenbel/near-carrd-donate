import React from 'react';
import PropTypes from 'prop-types';

export default function Messages({ messages }) {
  return (
    <>
      {messages.map((message, i) =>
        // TODO: format as cards, add timestamp
        <p key={i} className={message.premium ? 'is-premium' : ''}>
          <strong>{message.name} / {message.sender}</strong>:<br />
          {Math.round(message.amount / 1000000000000000000000000)} Near <br />
          {message.text}
        </p>
      )}
    </>
  );
}


Messages.propTypes = {
  messages: PropTypes.array
};
