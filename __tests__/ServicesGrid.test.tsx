import React from 'react';
import {Text, TouchableOpacity} from 'react-native';
import ReactTestRenderer, {act} from 'react-test-renderer';
import ServicesGrid from '../src/components/bazaar/ServicesGrid';
import {useNavigation} from '@react-navigation/native';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: jest.fn(),
}));

describe('ServicesGrid', () => {
  it('navigates to AgriProducts when the Agri Products card is pressed', () => {
    const navigate = jest.fn();
    (useNavigation as jest.Mock).mockReturnValue({navigate});

    let tree: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(<ServicesGrid />);
    });

    const cards = tree!.root.findAllByType(TouchableOpacity);

    act(() => {
      cards[2].props.onPress();
    });

    expect(navigate).toHaveBeenCalledWith('AgriProducts');
  });

  it('navigates to LabourBooking when the Labour Booking card is pressed', () => {
    const navigate = jest.fn();
    (useNavigation as jest.Mock).mockReturnValue({navigate});

    let tree: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(<ServicesGrid />);
    });

    const labourCard = tree!.root.findAllByType(TouchableOpacity).find(node => {
      const labelNodes = node.findAllByType(Text);
      return labelNodes.some(textNode => textNode.props.children === 'Labour Booking');
    });

    act(() => {
      labourCard?.props.onPress();
    });

    expect(navigate).toHaveBeenCalledWith('LabourBooking');
  });
});
