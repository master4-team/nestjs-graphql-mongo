import { every } from 'lodash';

export const isStringObj = (obj): boolean =>
  typeof obj === 'object' &&
  every(Object.values(obj), (item) => typeof item === 'string');

export const isNumberObj = (obj): boolean =>
  typeof obj === 'object' &&
  every(Object.values(obj), (item) => typeof item === 'number');
