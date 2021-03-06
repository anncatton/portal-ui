// @flow

import React from 'react';
import { graphql } from 'react-relay';
import { makeFilter } from '@ncigdc/utils/filters';
import { compose, withPropsOnChange, branch, renderComponent } from 'recompose';
import Query from '@ncigdc/modern_components/Query';

export default (Component: ReactClass<*>) =>
  compose(
    branch(
      ({ ssmId }) => !ssmId,
      renderComponent(() => (
        <div>
          <pre>ssmId</pre> must be provided
        </div>
      )),
    ),
    withPropsOnChange(['ssmId'], ({ ssmId }) => {
      return {
        variables: {
          filters: makeFilter([
            {
              field: 'ssms.ssm_id',
              value: [ssmId],
            },
          ]),
        },
      };
    }),
  )((props: Object) => {
    return (
      <Query
        parentProps={props}
        minHeight={53}
        variables={props.variables}
        Component={Component}
        query={graphql`
          query ConsequencesTable_relayQuery($filters: FiltersArgument) {
            viewer {
              explore {
                ssms {
                  hits(first: 1, filters: $filters) {
                    edges {
                      node {
                        cosmic_id
                        consequence {
                          hits(first: 99) {
                            edges {
                              node {
                                transcript {
                                  transcript_id
                                  aa_change
                                  is_canonical
                                  consequence_type
                                  annotation {
                                    hgvsc
                                    impact
                                  }
                                  gene {
                                    gene_id
                                    symbol
                                    gene_strand
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `}
      />
    );
  });
