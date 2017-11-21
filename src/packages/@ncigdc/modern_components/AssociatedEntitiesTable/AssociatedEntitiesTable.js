import React from 'react';
import { compose, withState } from 'recompose';
import { get } from 'lodash';

import EntityPageHorizontalTable from '@ncigdc/components/EntityPageHorizontalTable';
import { Row } from '@ncigdc/uikit/Flex';
import { withTheme } from '@ncigdc/theme';
import Hidden from '@ncigdc/components/Hidden';
import SearchIcon from 'react-icons/lib/fa/search';
import Showing from '@ncigdc/components/Pagination/Showing';
import Pagination from '@ncigdc/components/Pagination';
import SampleType from '@ncigdc/modern_components/SampleType';
import CaseLink from '@ncigdc/components/Links/CaseLink';
import AnnotationsLink from '@ncigdc/components/Links/AnnotationsLink';
import AnnotationLink from '@ncigdc/components/Links/AnnotationLink';
import { makeFilter } from '@ncigdc/utils/filters';
import Input from '@ncigdc/uikit/Form/Input';
import Link from '@ncigdc/components/Links/Link';
import { stringifyJSONParam } from '@ncigdc/utils/uri';

const getAnnotationsCount = (annotations, entity) => {
  const filteredAnnotations = annotations.hits.edges.filter(
    ({ node: a }) => a.entity_id === entity.entity_id,
  );

  if (filteredAnnotations.length === 1) {
    return (
      <AnnotationLink uuid={filteredAnnotations[0].node.annotation_id}>
        {filteredAnnotations.length}
      </AnnotationLink>
    );
  } else if (filteredAnnotations.length > 1) {
    return (
      <AnnotationsLink
        query={{
          filters: makeFilter([
            { field: 'annotations.entity_id', value: entity.entity_id },
          ]),
        }}
      >
        {filteredAnnotations.length}
      </AnnotationsLink>
    );
  }

  return filteredAnnotations.length.toLocaleString();
};

export default compose(
  withTheme,
  withState('searchValue', 'setSearchValue', ''),
)(({ parentVariables, repository, theme, searchValue, setSearchValue }) => {
  console.log(repository.files.hits);

  const annotations = get(repository, 'files.hits.edges[0].node.annotations');
  const ae = get(
    repository,
    'files.hits.edges[0].node.associated_entities.hits.edges',
    [],
  ).map(({ node: ae }) => ({
    ...ae,
    case_id: <CaseLink uuid={ae.case_id}>{ae.case_id}</CaseLink>,
    entity_submitter_id: (
      <CaseLink
        uuid={ae.case_id}
        query={ae.entity_type !== 'case' ? { bioId: ae.entity_id } : {}}
        deepLink={ae.entity_type !== 'case' ? 'biospecimen' : undefined}
      >
        {ae.entity_submitter_id}
      </CaseLink>
    ),
    sample_type: ['sample', 'portion', 'analyte', 'slide', 'aliquot'].some(
      x => x === ae.entity_type,
    ) ? (
      <SampleType entityType={ae.entity_type} entityId={ae.entity_id} />
    ) : (
      '--'
    ),
    annotation_count: getAnnotationsCount(annotations, ae),
  }));

  const total = get(
    repository,
    'files.hits.edges[0].node.associated_entities.hits.total',
    0,
  );

  return (
    <span>
      <Row
        style={{
          backgroundColor: 'white',
          padding: '1rem',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <Showing
          docType="associated cases/biospecimen"
          prefix="aeTable"
          params={parentVariables}
          total={total}
        />
      </Row>
      <EntityPageHorizontalTable
        data={ae}
        rightComponent={
          <Row>
            <label htmlFor="filter-cases">
              <div
                style={{
                  borderTop: `1px solid ${theme.greyScale5}`,
                  borderLeft: `1px solid ${theme.greyScale5}`,
                  borderBottom: `1px solid ${theme.greyScale5}`,
                  borderRight: 0,
                  borderRadius: '4px 0 0 4px',
                  backgroundColor: `${theme.greyScale4}`,
                  width: '38px',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <SearchIcon size={14} />
              </div>
              <Hidden>filter cases</Hidden>
            </label>
            <Input
              value={searchValue}
              style={{
                fontSize: '14px',
                paddingLeft: '1rem',
                border: `1px solid ${theme.greyScale5}`,
                width: '28rem',
                borderRadius: '0 4px 4px 0',
              }}
              placeholder="Search for associated cases/biospecimen"
              onChange={e => setSearchValue(e.target.value)}
              type="text"
            />
            <Link
              merge="toggle"
              query={{
                aeTable_filters: stringifyJSONParam(
                  makeFilter([
                    {
                      field: 'files.associated_entities.entity_id',
                      value: [searchValue],
                    },
                  ]),
                ),
              }}
              dark={!!searchValue}
              onClick={() => setSearchValue('')}
            >
              Go!
            </Link>
          </Row>
        }
        title="Associated Cases/Biospecimen"
        emptyMessage="No cases or biospecimen found."
        headings={[
          { key: 'entity_submitter_id', title: 'Entity ID' },
          { key: 'entity_type', title: 'Entity Type' },
          { key: 'sample_type', title: 'Sample Type' },
          { key: 'case_id', title: 'Case UUID' },
          { key: 'annotation_count', title: 'Annotations' },
        ]}
      />
      <Pagination prefix="aeTable" params={parentVariables} total={total} />
    </span>
  );
});
