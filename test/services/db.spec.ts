import { dbConnect, dbDisconnect } from '../../src/services/db'
import chai from 'chai'
import sinon from 'sinon'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)

describe('db utility module test', function () {
  it('test connect', async function () {
    const connectFuncStub = sinon.stub()
    await dbConnect(connectFuncStub)
    /* eslint-disable-next-line no-unused-expressions */
    chai.expect(connectFuncStub.calledOnceWith('mongodb://127.0.0.1:27017/Taskify')).is.true
  })

  it('test connect when env has db url value', async function () {
    const connectFuncStub = sinon.stub()
    process.env.DB_URL = 'mongodb://example.com:test'
    await dbConnect(connectFuncStub)
    /* eslint-disable-next-line no-unused-expressions */
    chai.expect(connectFuncStub.calledOnceWith('mongodb://example.com:test')).is.true
    delete process.env.DB_URL
  })

  it('test connect throws error', async function () {
    const connectFuncStub = sinon.stub()
    connectFuncStub.rejects(new Error('test error'))
    await chai.expect(dbConnect(connectFuncStub)).to.eventually.be.rejected
      .and.be.an.instanceOf(Error)
      .and.have.property('message', 'test error')
    /* eslint-disable-next-line no-unused-expressions */
    chai.expect(connectFuncStub.called).is.true
  })

  it('test disconnect', async function () {
    const disconnectFuncStub = sinon.stub()
    await dbDisconnect(disconnectFuncStub)
    /* eslint-disable-next-line no-unused-expressions */
    chai.expect(disconnectFuncStub.called).is.true
  })

  it('test disconnect throws error', async function () {
    const disconnectFuncStub = sinon.stub()
    disconnectFuncStub.rejects(new Error('test error'))
    await chai.expect(dbDisconnect(disconnectFuncStub)).to.eventually.be.rejected
      .and.be.an.instanceOf(Error)
      .and.have.property('message', 'test error')
    /* eslint-disable-next-line no-unused-expressions */
    chai.expect(disconnectFuncStub.called).is.true
  })
})
