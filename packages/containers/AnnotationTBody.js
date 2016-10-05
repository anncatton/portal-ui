/* @flow */

import React from 'react';
import Relay from 'react-relay';
import { compose } from 'recompose';
import { createContainer } from 'recompose-relay';

import AnnotationTr from './AnnotationTr';

type PropsType = {
  edges: [{
    node: {
      id: string,
    },
  }],
};

const AnnotationTBody = (props: PropsType) => (
  <tbody>
    {props.edges.map(e => (
      <AnnotationTr {...e} key={e.node.id} />
    ))}
  </tbody>
);

const AnnotationTBodyQuery = {
  fragments: {
    edges: () => Relay.QL`
      fragment on AnnotationEdge @relay(plural: true){
        node {
          id
          ${AnnotationTr.getFragment('node')}
        }
      }
    `,
  },
};

export default compose(
  createContainer(AnnotationTBodyQuery)
)(AnnotationTBody);