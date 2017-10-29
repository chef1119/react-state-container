import createStore from "../.."
import { connect, getActions } from "../index"

const Svelte = function(options) {
  return {
    _state: (options ? options.data : null) || {},

    unsubscribe: null,

    set: function (newState) {
      this._set(this.assign({}, newState));
    },

    _set: function(newState) {
      var oldState = this._state,
        changed = {},
        dirty = false;
    
      for (var key in newState) {
        if (this.differs(newState[key], oldState[key])) changed[key] = dirty = true;
      }
      if (!dirty) return;
    
      this._state = this.assign({}, oldState, newState);
    },

    get: function(key) {
      return key ? this._state[key] : this._state;
    },

    on: function(eventName, eventHandler) {
      if (eventName === 'destroy') {
        this.unsubscribe = eventHandler;
      }
    },

    differs: function(a, b) {
      return a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    },

    assign: function (target) {
      var k,
        source,
        i = 1,
        len = arguments.length;
      for (; i < len; i++) {
        source = arguments[i];
        for (k in source) target[k] = source[k];
      }
    
      return target;
    }
  }
}

describe("redux-zero - svelte bindings", () => {
  const listener = jest.fn()
  let store, unsubscribe
  beforeEach(() => {
    store = createStore({})
    listener.mockReset()
    unsubscribe = store.subscribe(listener)
  })

  test("set - string", () => {
    const svt = Svelte()
    const mapToProps = ({ message }) => ({ message });
    const state = { message: "hello" }

    store.setState(state)

    connect(svt, store, mapToProps)

    expect(svt.get('message')).toEqual(store.getState().message)
    expect(svt.get()).toEqual(store.getState())
    
    const newState = { message: "hello world" }
    store.setState(newState)

    expect(newState).toEqual(store.getState())
    expect(svt.get('message')).toEqual(store.getState().message)
    expect(svt.get()).toEqual(store.getState())
  })

  test("set - number", () => {
    const svt = Svelte()
    const mapToProps = ({ count }) => ({ count });
    const state = { count: 1 }

    store.setState(state)

    connect(svt, store, mapToProps)

    expect(svt.get('count')).toEqual(store.getState().count)
    expect(svt.get()).toEqual(store.getState())
    
    const newState = { count: 2 }
    store.setState(newState)

    expect(newState).toEqual(store.getState())
    expect(svt.get('count')).toEqual(store.getState().count)
    expect(svt.get()).toEqual(store.getState())
  })

  test("set - object", () => {
    const svt = Svelte()
    const mapToProps = ({ nested }) => ({ nested });
    const state = { nested: { count: 1 } }

    store.setState(state)

    connect(svt, store, mapToProps)

    expect(svt.get('nested')).toEqual(store.getState().nested)
    expect(svt.get()).toEqual(store.getState())
    
    const newState = { nested: { count: 2 } }
    store.setState(newState)

    expect(newState).toEqual(store.getState())
    expect(svt.get('nested')).toEqual(store.getState().nested)
    expect(svt.get()).toEqual(store.getState())
  })

  test("set - object - same instance", () => {
    const svt = Svelte()
    const mapToProps = ({ nested }) => ({ nested });
    const state = { nested: { count: 1 } }

    store.setState(state)

    connect(svt, store, mapToProps)

    expect(svt.get('nested')).toEqual(store.getState().nested)
    expect(svt.get()).toEqual(store.getState())
    
    const newState = { nested: { count: 2 } }
    store.setState(newState)
    expect(svt.get('nested').count).toEqual(2)

    newState.nested = { count: 3 }
    store.setState(newState)    
    expect(svt.get('nested').count).toEqual(3)
  })

  test("action - increment", () => {
    const svt = Svelte()
    const mapToProps = ({ count }) => ({ count })
    const state = { count: 1 }

    const actions = store => ({
      increment: state => ({ count: state.count + 1 })
    })
    const increment = getActions(store, actions).increment

    store.setState(state)
    connect(svt, store, mapToProps)
    expect(svt.get('count')).toEqual(store.getState().count)
    
    const newState = { count: 2 }    
    increment()

    expect(svt.get('count')).toEqual(newState.count)
    expect(svt.get('count')).toEqual(store.getState().count)
    expect(svt.get()).toEqual(store.getState())
  })

  test("action - increment - nested", () => {
    const svt = Svelte()
    const mapToProps = ({ nested }) => ({ nested })
    const state = { nested: { count: 1 } }

    const actions = store => ({
      increment: state => ({ nested: { count: state.nested.count + 1 } })
    })
    const increment = getActions(store, actions).increment

    store.setState(state)
    connect(svt, store, mapToProps)
    expect(svt.get('nested').count).toEqual(store.getState().nested.count)
    
    const newState =  { nested: { count: 2 } }
    increment()

    expect(svt.get('nested')).toEqual(newState.nested)
    expect(svt.get('nested').count).toEqual(store.getState().nested.count)
    expect(svt.get()).toEqual(store.getState())
  })
})
