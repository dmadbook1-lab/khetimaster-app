import React from 'react';
import renderer from 'react-test-renderer';

import CartScreen from '../src/screens/agriproducts/CartScreen';

test('renders cart screen', () => {
  const tree = renderer.create(
    <CartScreen navigation={{goBack: jest.fn(), navigate: jest.fn()}} />,
  );

  expect(tree.toJSON()).toBeTruthy();
});
