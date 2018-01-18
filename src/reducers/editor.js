import { CODE, SOLUTIONS } from '../assets/codeRef'
import composeCodeStore, { createOrderKey, populateCodeStore } from './utils'
import WELCOME_MESSAGE from '../assets/seed/welcome'
import { findIndex, indexOf, replace } from 'lodash'

import {
  NEXT_SNIPPET,
  PREVIOUS_SNIPPET,
  RESET_STATE,
  SELECT_SNIPPET,
  SELECT_SOLUTION,
  UPDATE_CODE
} from '../actions/editor'


// temporarily disable CONSOLE_LOG
// action in order to debug reducer
export const disableLogAction = false


// define reducer's initial state
const initialState = {
  welcome: true,
  current: {
    id: 'Quicksort',
    code: WELCOME_MESSAGE,
    isSolution: false
  },
  codeStore: populateCodeStore(CODE),
  orderKey: createOrderKey(CODE)
}


// reducer's default state is either the initial state or
// is pulled from local storage, which is set in index.js
let defaultState = JSON.parse(
  localStorage.getItem('cs-pg-react-editorState')
) || initialState


// if lengths differ, call composeCodeStore to merge in
// new challenges and remove dupes due to previous bug
if (
  initialState.codeStore.length !==
  defaultState.codeStore.length
) {
  console.log('composing code store')
  defaultState.orderKey = createOrderKey(CODE)
  defaultState.codeStore = composeCodeStore(
    initialState,
    defaultState
  )
}


// meaningless abstraction:
const updateUserCode = (state) => {
  if (!state.current.isSolution && !state.welcome) {
    return state.codeStore.map(codeObj => {
      if (state.current.id === codeObj.id) {
        return {
          ...codeObj,
          userCode: state.current.code
        }
      } else {
        return codeObj
      }
    })
  } else {
    return state.codeStore
  }
}


export default (state = defaultState, action) => {
  switch(action.type) {
    case RESET_STATE:
      localStorage.removeItem('cs-pg-react-editorState')
      return initialState
    case UPDATE_CODE:
      return {
        ...state,
        current: {
          ...state.current,
          code: action.code
        }
      }
    case SELECT_SOLUTION:
      return {
        ...state,
        welcome: false,
        codeStore: updateUserCode(state),
        current: {
          id: action.id,
          code: SOLUTIONS[action.id],
          isSolution: true
        }
      }
    case SELECT_SNIPPET:
      let idx = findIndex(state.codeStore, { id: action.id });
      return {
        ...state,
        welcome: false,
        codeStore: updateUserCode(state),
        current: {
          id: action.id,
          code: state.codeStore[idx].userCode,
          isSolution: false
        }
      }
    case NEXT_SNIPPET: {
      let { orderKey } = state
      let i = indexOf(orderKey, state.current.id);
      let next = (state.welcome || i === orderKey.length - 1) ? 0 : i+1
      next = findIndex(state.codeStore, { id: orderKey[next] })
      return {
        ...state,
        welcome: false,
        codeStore: updateUserCode(state),
        current: {
          id: state.codeStore[next].id,
          code: state.codeStore[next].userCode,
          isSolution: false
        }
      }
    }
    case PREVIOUS_SNIPPET: {
      let { orderKey } = state
      let i = indexOf(orderKey, state.current.id);
      let prev = (state.welcome || i === 0) ? orderKey.length - 1 : i-1
      prev = findIndex(state.codeStore, { id: orderKey[prev] })
      return {
        ...state,
        welcome: false,
        codeStore: updateUserCode(state),
        current: {
          id: state.codeStore[prev].id,
          code: state.codeStore[prev].userCode,
          isSolution: false
        }
      }
    }
    default:
      return state
  }
}
