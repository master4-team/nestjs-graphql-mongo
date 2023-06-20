import { FieldsByTypeName } from 'graphql-parse-resolve-info';
import { isEmpty, mapKeys } from 'lodash';
import {
  _IDS,
  _ID,
  _IN,
  _OPERATORS,
  _OR,
  _AND,
  OR,
  AND,
} from '../../common/constants';
import { isPrimitive } from '../../utils/isPrimitive';
import { IWhereArgs, ISortArgs } from './base.types';
import { SortOrder } from 'mongoose';

function processFilterId(filter: IWhereArgs): IWhereArgs {
  if (filter[_IDS] && filter[_IDS].length) {
    return { [_ID]: { [_IN]: filter[_IDS] } };
  }

  return filter[_ID] ? { [_ID]: filter[_ID] } : {};
}

function processPrimitiveFilter(
  filter: IWhereArgs,
  parentField: string = null,
): IWhereArgs {
  return Object.keys(filter).reduce((all, key) => {
    if (isPrimitive(filter[key])) {
      const field = parentField ? `${parentField}.${key}` : key;
      all[field] = filter[key];
    }
    return all;
  }, {});
}

function processFilterOperators(
  filter: IWhereArgs,
  parentField: string = null,
): IWhereArgs {
  const operatorsFilter = filter[_OPERATORS];

  return !isEmpty(operatorsFilter)
    ? Object.keys(operatorsFilter).reduce((all, key) => {
        const field = parentField ? `${parentField}.${key}` : key;
        all[field] = mapKeys(operatorsFilter[key], (_v, k) => `$${k}`);
        return all;
      }, {})
    : {};
}

function processFilter(
  filter: IWhereArgs,
  parentField: string = null,
): IWhereArgs {
  return {
    ...processFilterId(filter),
    ...processPrimitiveFilter(filter, parentField),
    ...processFilterOperators(filter, parentField),
  };
}

function processFilterAndOr(
  filter: IWhereArgs,
  parentField: string = null,
): IWhereArgs {
  const { OR, AND } = filter;
  const result: IWhereArgs = {};

  if (OR && OR.length) {
    result[_OR] = OR.map((item) => processFilter(item, parentField));
  }

  if (AND && AND.length) {
    result[_AND] = AND.map((item) => processFilter(item, parentField));
  }

  return result;
}

export function parseFilter(filter: IWhereArgs): IWhereArgs {
  const { _search, ...remainingFilter } = filter;
  const result: IWhereArgs = {};
  const andORFilter = processFilterAndOr(remainingFilter);
  const idFilter = processFilterId(remainingFilter);
  const operatorsFilter = processFilterOperators(remainingFilter);
  const primitiveFilter = processPrimitiveFilter(remainingFilter);

  const childFilters: IWhereArgs[] = [];
  Object.keys(filter).forEach((key) => {
    const filterValue = filter[key];
    if (
      !isPrimitive(filterValue) &&
      ![_OPERATORS, AND, OR, _ID, _IDS].includes(key)
    ) {
      const childOperators = processFilterOperators(filterValue, key);
      const childPrimitive = processPrimitiveFilter(filterValue, key);
      childFilters.push(childOperators, childPrimitive);
    }
  });

  Object.assign(result, {
    [_AND]: [idFilter, operatorsFilter, primitiveFilter, ...childFilters],
  });

  if (andORFilter[_AND]) {
    result[_AND].concat(andORFilter[_AND]);
  }

  if (andORFilter[_OR]) {
    result[_OR] = andORFilter[_OR];
  }

  if (_search) {
    result.$text = { $search: `"${_search}"` };
  }
  return result;
}

export function parseSortFilter(sort: ISortArgs): { [key: string]: SortOrder } {
  return Object.keys(sort).reduce((all, field) => {
    const sortValue = sort[field];
    if (isPrimitive(sortValue)) {
      all[field] = (sortValue as string).toLowerCase();
    }

    if (typeof sortValue === 'object') {
      const childSort = parseSortFilter(sort[field] as ISortArgs);
      Object.keys(childSort).forEach((key) => {
        all[`${field}.${key}`] = childSort[key];
      });

      delete sort[field];
    }

    return all;
  }, {});
}

export function processQueryFields(fieldsByTypeName: FieldsByTypeName): {
  [field: string]: 1 | 0;
} {
  const keys = Object.keys(fieldsByTypeName);
  if (!keys.length) return null;

  const queryFields = fieldsByTypeName[keys[0]];
  return Object.keys(queryFields).reduce((all, field) => {
    const { name, fieldsByTypeName: childFieldsByTypeName } =
      queryFields[field];
    const processedQueryChildFields =
      processQueryFields(childFieldsByTypeName) || {};
    const childKeys = Object.keys(processedQueryChildFields);
    if (!childKeys.length) {
      all[name] = 1;
    } else {
      childKeys.forEach((key) => {
        all[`${name}.${key}`] = 1;
      });
    }
    return all;
  }, {});
}
