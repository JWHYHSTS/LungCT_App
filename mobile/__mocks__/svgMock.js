const React = require('react');
const { View } = require('react-native');

const MockSvg = (props) => React.createElement(View, { testID: 'mock-svg', ...props });
module.exports = MockSvg;
