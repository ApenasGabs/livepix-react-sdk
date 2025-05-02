import { CSSProperties } from 'react';

const buttonStyles: CSSProperties = {
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
};

const buttonHoverStyles: CSSProperties = {
    backgroundColor: '#0056b3',
};

export { buttonStyles, buttonHoverStyles };