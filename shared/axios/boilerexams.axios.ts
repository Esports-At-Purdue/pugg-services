import Axios from "axios";

export const boilerexamsAxios = Axios.create({
    baseURL: Bun.env.BOILEREXAMS_URL,
    withCredentials: true,
    headers: {
        Authorization: Bun.env.BOILEREXAMS_AUTHORIZATION
    }
})