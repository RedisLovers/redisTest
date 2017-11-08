import mongoose from 'mongoose';
import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';
import app from '../../index';

chai.config.includeStack = true;

describe('## User APIs', () => {
  let user = {
    name: 'KK123',
  };

  describe('# POST /api/users', () => {
    function userCreation(){
      it('should create a new user', (done) => {
        request(app)
          .post('/api/users')
          .send(user)
          .expect(httpStatus.OK)
          .then((res) => {
            done();
          })
          .catch(done);
      });
    }
    for(let i = 0; i < 100000; i++){
      userCreation();
    }
  });
});
