import Comporoto from '@bfchain/comproto';

import ava, { ExecutionContext, TestInterface } from 'ava';
import test from 'ava';

// const comproto  = new Comporoto();

console.log(Comporoto);

test.beforeEach(() => {
    console.log('before each');
});

test('test yingyingying', async (t) => {
    console.log('test 111');
    t.is(1, 1);
});



