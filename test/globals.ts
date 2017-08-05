import * as chai from 'chai';
import * as fixtures from './fixtures';
import * as lodash from 'lodash';
import * as sinon from 'sinon';

(global as any).expect = chai.expect;
(global as any).fixtures = fixtures;
(global as any).sinon = sinon;
(global as any)._ = lodash;
