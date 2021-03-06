;(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory)
  } else if (typeof exports === 'object') {
    module.exports = {
      dispatch: factory.dispatch,
      getState: factory.getState,
      createStore: factory.createStore,
      subscribe: factory.subscribe,
      combine: factory.combine,
    }
  } else {
    root.Dutier = factory
  }
}(this, function (global) {
  /**
   * @name Dutier
   * @description The object that will manage all application state
   */
  let Dutier = {
    /**
     * @name _store
     * @description The private store
     */
    _store: {
      /**
       * @name state
       * @description The initial store application state
       */
      state: {},
      /**
       * @name _state
       * @description The new application state
       * based on reducers values
       */
      _state: {},
      /**
       * @name handlers
       * @description The subscribe handlers function
       */
      handlers: [],
      /**
       * @name reducer
       * @description The reducer function
       */ 
      reducer: {}
    }
  }
  /**
   * @name unsubscribe
   * @description Unsubscribes from listening to a component
   * @param {Component} component The Component
   **/
  function unsubscribe(handler){
    const components = Dutier._store.handlers
    components.forEach( ( fn, index ) => {
      if ( fn === handler) {
        components.splice(index, 1)
      }
    })
  }
  // Apply the reducers function
  function applyReducer ( action ) {
    const reducers = Dutier._store.reducer
    const initialState = Object.assign({}, Dutier._store.state)
    const actualState = Object.assign(initialState, Dutier._store._state)
    
    Object.keys(reducers)
      .forEach( reducer => {
        const value = reducers[reducer].call(null, actualState, action)
        if ( JSON.stringify(value) !== JSON.stringify(actualState) ) {
          Object.assign(Dutier._store._state, initialState, value)
          return
        }
      })
      
    return Object.assign({}, { type: action.type } , { state: Object.assign({}, Dutier._store._state) })
  }
  
  // update the component
  function updateComponent ( { type } ) {
    const state = Object.assign({}, Dutier._store._state)
    Dutier._store.handlers.forEach( handler => {
      if (handler !== undefined && typeof handler === 'function') {
        handler({ type, state })
      }
    })
    return { type, state }
  }
  return {
    /**
     * @name subscribe
     * @description Subscribe to call the handler function when the action will be triggered
     * @param {Component} component The Component
     * @param {Function} handler The function that will be called
     **/
    subscribe: ( handler ) => {
      Dutier._store
        .handlers
        .push(handler)
      return () => {
        unsubscribe(handler)
      }
    },
    /**
     * @name dispatch
     * @description Dispatch an action to change
     * the store state
     * @param { string } action The action name
     */
    dispatch: (action) => {
      return Promise
        .resolve(action)
        .then(applyReducer)
        .then(updateComponent)
    },
    /**
     * @name createStore
     * @description Sets the application data state
     * @param {object} data Simple Object that contain the State
     */
    createStore: ( state, ...reducers ) => {
      // register reducers
      reducers.forEach( (reducer, i ) => Dutier._store.reducer[ i ] = reducer);
      // setting the immutable initial state return Dutier.store
      Object.assign(Dutier._store.state, state)
    },
    /**
     * @name combine
     * @description Combine the reducers
     */
    combine: ( ...reducers ) => {
      const len =  Object.keys(Dutier._store.reducer).length
      reducers.forEach( reducer => Dutier._store.reducer[len + 1] = reducer)
    },
    /**
     * @name getState
     * @return {Object} a copy of the state
     */
    getState: () => {
      return Object.assign({}, Dutier._store.state, Dutier._store._state)
    }
  }
}(this)))