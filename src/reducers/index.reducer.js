import { combineReducers } from "redux";
import * as actionTypes from "./../reduxTypes/types";

const initialUserState = {
  currentUser: null,
  isLoading: true,
  currentChannel: null
};

//user reucers

const user_reducer = (state = initialUserState, action) => {
  switch (action.type) {
    case actionTypes.SET_USER:
      return {
        currentUser: action.payload.currentUser,
        isLoading: false
      };
    case actionTypes.CLEAR_USER:
      return {
        ...initialUserState,
        isLoading: false
      };
    default:
      return state;
  }
};

//channel reducers

const initialChannelState = {
  currentChannel: null,
  isPrivateChannel: false,
  userPosts: null
};

const channel_reducer = (state = initialChannelState, action) => {
  switch (action.type) {
    case actionTypes.SET_CURRENCHANNEL:
      return {
        ...initialChannelState,
        currentChannel: action.payload.currentChannel
      };

    case actionTypes.SET_PRIVATE_CHANNEL:
      return {
        ...state,

        isPrivateChannel: action.payload.isPrivateChannel
      };

    case actionTypes.SET_USER_POSTS:
      return {
        ...state,
        userPosts: action.payload.userPosts
      };

    default:
      return state;
  }
};

const initialColorsState = {
  primaryColor: "",
  secondaryColor: ""
};

const colors_reducer = (state = initialColorsState, action) => {
  switch (action.type) {
    case actionTypes.SET_COLORS:
      return {
        primaryColor: action.payload.primaryColor,
        secondaryColor: action.payload.secondaryColor
      };
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  user: user_reducer,
  channel: channel_reducer,
  colors: colors_reducer
});

export default rootReducer;
