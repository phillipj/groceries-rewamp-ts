// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';

// Tot some very weird errors about document.createRange not being a function
// when running tests that clicked an element, found the polyfill below on StackOverflow
// @ts-ignore
global.window.document.createRange = function createRange() {
  return {
    setEnd: () => {},
    setStart: () => {},
    getBoundingClientRect: () => {
      return {right: 0};
    },
    getClientRects: () => [],
    commonAncestorContainer: document.createElement('div'),
  };
};
