import React from 'react';
import { get } from 'lodash';

import GreyBox from '@ncigdc/uikit/GreyBox';
import AnnotationsLink from '@ncigdc/components/Links/AnnotationsLink';
import AnnotationLink from '@ncigdc/components/Links/AnnotationLink';
import { makeFilter } from '@ncigdc/utils/filters';

const getAnnotationsCount = hits => {
  const annotations = hits.edges;
  if (annotations.length === 0) {
    return 0;
  }
  if (annotations.length === 1) {
    return (
      <AnnotationLink uuid={annotations[0].node.annotation_id}>
        {hits.total}
      </AnnotationLink>
    );
  }
  return (
    <AnnotationsLink
      query={{
        filters: makeFilter([
          {
            field: 'annotations.entity_id',
            value: annotations[0].node.entity_id,
          },
        ]),
      }}
    >
      {hits.total}
    </AnnotationsLink>
  );
};

export default ({ repository, loading }) =>
  loading ? (
    <GreyBox />
  ) : (
    getAnnotationsCount(
      get(repository, 'files.hits.edges[0].node.annotations.hits', {
        edges: [],
      }),
    )
  );
