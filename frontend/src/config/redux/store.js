import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./reducer/authReducer"

import postReducer from "./reducer/postReducer"

/**
*steps for state managemenet
*submit action
*handle action in its reducer
*register here->Reducer
**/

export const store=configureStore({
    reducer:{
        auth:authReducer,
        posts:postReducer
    }
})