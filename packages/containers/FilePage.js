/* @flow */

import React from 'react';
import Relay from 'react-relay';
import { compose } from 'recompose';
import { createContainer } from 'recompose-relay';

type PropsType = {
  node: {
    access: string,
    cases: {
      project: {
        project_id: string,
      },
    }[],
    data_category: string,
    data_format: string,
    file_id: string,
    file_name: string,
    file_size: number,
    platform: string,
  },
};

const FilePage = (props: PropsType) => (
  <div>
    <div>{props.node.file_id}</div>
    <div>{props.node.file_name}</div>
    <div>{props.node.file_size}</div>
    <div>{props.node.access}</div>
    <div>{props.node.data_category}</div>
    <div>{props.node.data_format}</div>
    <div>{new Set(props.node.cases.map(c => c.project.project_id))}</div>
    <div>{props.node.platform}</div>
  </div>
);

const FilePageQuery = {
  fragments: {
    node: () => Relay.QL`
      fragment on File {
        file_id
        file_name
        file_size
        access
        data_category
        data_format
        cases {
          project {
            project_id
          }
        }
        platform
      }
    `,
  },
};
export default compose(
  createContainer(FilePageQuery)
)(FilePage);