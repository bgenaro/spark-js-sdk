import React from 'react';
import renderer from 'react-test-renderer';

import ActivityList from '.';

describe(`ActivityList component`, () => {
  const activities = [{
    id: `test-123-123-123-123`,
    content: `Test Activity Content 1`,
    name: `Test User 1`,
    timestamp: `2016-09-20T19:52:57.186Z`
  }, {
    id: `test-456-456-456-456`,
    content: `Test Activity Content 2`,
    name: `Test User 2`,
    timestamp: `2016-09-21T19:52:57.186Z`
  }];

  const component = renderer.create(
    <ActivityList
      activities={activities}
    />
  );

  it(`renders properly`, () => {
    expect(component).toMatchSnapshot();
  });
});