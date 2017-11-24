import React from 'react';
import { compose, withState, withPropsOnChange } from 'recompose';
import { get, debounce } from 'lodash';
import { parse } from 'query-string';

import EntityPageHorizontalTable from '@ncigdc/components/EntityPageHorizontalTable';
import { Row } from '@ncigdc/uikit/Flex';
import { withTheme } from '@ncigdc/theme';
import Hidden from '@ncigdc/components/Hidden';
import SearchIcon from 'react-icons/lib/fa/search';
import Showing from '@ncigdc/components/Pagination/Showing';
import Pagination from '@ncigdc/components/Pagination';
import SampleType from '@ncigdc/modern_components/SampleType';
import FileAnnotations from '@ncigdc/modern_components/FileAnnotations';
import CaseLink from '@ncigdc/components/Links/CaseLink';
import Dropdown from '@ncigdc/uikit/Dropdown';
import DropdownItem from '@ncigdc/uikit/DropdownItem';
import DownCaretIcon from 'react-icons/lib/fa/caret-down';
import { replaceFilters, removeFilter } from '@ncigdc/utils/filters';
import Input from '@ncigdc/uikit/Form/Input';
import withRouter from '@ncigdc/utils/withRouter';
import { parseFilterParam, stringifyJSONParam } from '@ncigdc/utils/uri';
import CloseIcon from '@ncigdc/theme/icons/CloseIcon';

const pushFilters = debounce((field, value, filters, push) => {
  const newFilters = value
    ? replaceFilters(
        {
          op: 'and',
          content: [
            {
              op: 'in',
              content: {
                field: field,
                value: [value],
              },
            },
          ],
        },
        filters,
      )
    : removeFilter(field, filters);
  push({
    query: {
      filters: stringifyJSONParam(newFilters),
    },
  });
}, 700);

const fieldToDisplayName = {
  'files.associated_entities.entity_submitter_id': 'Entity ID',
  'files.associated_entities.case_id': 'Case UUID',
};

export default compose(
  withRouter,
  withTheme,
  withState('searchValue', 'setSearchValue', ''),
  withState(
    'searchField',
    'setSearchField',
    'files.associated_entities.entity_submitter_id',
  ),
  withPropsOnChange(
    ['location'],
    ({ location: { search }, searchValue, setSearchValue, setSearchField }) => {
      const q = parse(search);
      const filters = parseFilterParam(q.filters, { content: [] });
      const aeTableFilters = filters.content;
      console.log(aeTableFilters);

      const fieldsToValues = aeTableFilters.reduce(
        (acc, f) => ({
          ...acc,
          [f.content.field]: f.content.value,
        }),
        {},
      );
      console.log(fieldsToValues);
      if (Object.keys(fieldsToValues).length) {
        const currentField = Object.keys(fieldsToValues)[0];
        const currentValue = fieldsToValues[currentField];
        setSearchField(currentField);
        setSearchValue(currentValue);
      }

      return {
        filters,
      };
    },
  ),
)(
  ({
    push,
    history,
    parentVariables,
    repository,
    theme,
    searchValue,
    setSearchValue,
    searchField,
    setSearchField,
    filters,
  }) => {
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
      annotation_count: <FileAnnotations entityId={ae.entity_id} />,
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
              <Dropdown
                style={{
                  borderTop: `1px solid ${theme.greyScale5}`,
                  borderLeft: 0,
                  borderBottom: `1px solid ${theme.greyScale5}`,
                  borderRight: 0,
                  fontSize: '14px',
                  padding: 0,
                }}
                button={
                  <Row style={{ padding: '0 4px 0 4px', marginBottom: '-1px' }}>
                    {fieldToDisplayName[searchField]}
                    <span style={{ paddingLeft: '4px' }}>
                      <DownCaretIcon />
                    </span>
                  </Row>
                }
              >
                {Object.keys(fieldToDisplayName).map(field => (
                  <DropdownItem
                    onClick={() => setSearchField(field)}
                    aria-label={fieldToDisplayName[field]}
                  >
                    {fieldToDisplayName[field]}
                  </DropdownItem>
                ))}
              </Dropdown>

              <Row>
                <Input
                  value={searchValue}
                  style={{
                    fontSize: '14px',
                    paddingLeft: '1rem',
                    border: `1px solid ${theme.greyScale5}`,
                    width: '28rem',
                    borderRadius: '0 4px 4px 0',
                  }}
                  placeholder="eg. TCGA-13*, *13*, *09"
                  onChange={e => {
                    setSearchValue(e.target.value);
                    pushFilters(searchField, e.target.value, filters, push);
                  }}
                  type="text"
                />
                {!!searchValue.length && (
                  <CloseIcon
                    style={{
                      position: 'absolute',
                      right: 0,
                      padding: '10px',
                      fontSize: '14px',
                      transition: 'all 0.3s ease',
                      outline: 0,
                    }}
                    onClick={() => {
                      setSearchValue('');
                      push({
                        query: removeFilter(searchField, filters),
                      });
                    }}
                  />
                )}
              </Row>
            </Row>
          }
          title="Associated Cases/Biospecimen"
          emptyMessage="No cases or biospecimen found."
          emptyMessageStyle={{ background: '#fff' }}
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
  },
);
