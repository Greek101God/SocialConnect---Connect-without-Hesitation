import { use } from "react";
import { clientServer } from '@/config';
import { asyncThunkCreator, createAsyncThunk } from "@reduxjs/toolkit";



export const loginUser = createAsyncThunk(
     "user/login",
     async (user , thunkAPI) => {
        try{

            const response=await clientServer.post("/user/login",{
                email:user.email,
                password:user.password
            });

            if(response.data.token){
            localStorage.setItem("token",response.data.token);
            return response.data;
            }
            else{
                return thunkAPI.rejectWithValue({
                    message:"token not provided"
                });
            }
        }
        catch(error){
            
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

export const registerUser=createAsyncThunk(
    "user/register",
    async(user,thunkAPI)=>{
        try{

            const request=  await clientServer.post("/user/register",{
                username:user.username,
                password:user.password,
                email:user.email,
                name:user.name
        });
        return request.data;
        }
        catch(error){
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
)       

export const getAboutUser=createAsyncThunk(
    "user/getAboutUser",
    async(user,thunkAPI)=>{
        try{

            const response=await clientServer.get("/user/get_user_and_profile",{
                params:{
                    token : user.token
                }
            })
            return thunkAPI.fulfillWithValue(response.data)

        }catch(err){
            return thunkAPI.rejectWithValue(err.response.data)
        }
    }
)

export const getAllUsers= createAsyncThunk(
    "user/getAllUsers",
    async(_,thunkAPI)=>{
        try{

            const response=await clientServer.get("/user/get_all_profiles")
            return thunkAPI.fulfillWithValue(response.data);

        }
        catch(err){
            return thunkAPI.rejectWithValue(err.response.data)
        }
    }
)
    

export const sendConnectionRequest=createAsyncThunk(
    "user/sendConnectionRequest",
    async(user,thunkAPI)=>{
        try{
            const response=await clientServer.post("/user/send_connection_request",{
                token:user.token,
                connectionId:user.user_id
            })

            thunkAPI.dispatch(getMyConnectionRequests({token:user.token}))
            
            return thunkAPI.fulfillWithValue(response.data);
        }catch(error){
            return thunkAPI.rejectWithValue(error.response.data.message);
        }
    }
)

export const getConnectionsRequest=createAsyncThunk(
    "user/getConnectionRequests",
    async(user,thunkAPI)=>{
        try{
            const response=await clientServer.get("/user/user_connection_request",{
                params:{
                    token:user.token
                }
            })

            return  thunkAPI.fulfillWithValue(response.data);
        }catch(error){
            console.log(error)
            return thunkAPI.rejectWithValue(error.response.data.message);
        }
    }
)

export const getMyConnectionRequests=createAsyncThunk(
    "user/getMyConnectionRequests",
    async(user,thunkAPI)=>{
        try{
            const response=await clientServer.get("/user/get_my_connections_requests",{
                params:{
                    token:user.token
                }
            });
            return thunkAPI.fulfillWithValue(response.data);
        }
        catch(error){
            return thunkAPI.rejectWithValue(error.response.data.message);
        }
    }
)

export const acceptConnection=createAsyncThunk(
    "user/acceptConnection",
    async(user,thunkAPI)=>{
        try{
            const response = await clientServer.post("/user/accept_connection_request",{
                token:user.token,
                requestId : user.requestId,
                action_type:user.action
            }); 
            thunkAPI.dispatch(getConnectionsRequest({token:user.token}));
            return thunkAPI.fulfillWithValue(response.data);
        }
        catch(error){
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
)


