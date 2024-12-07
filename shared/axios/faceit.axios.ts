import Axios from "axios";

export const faceitAxios = Axios.create({
    baseURL: Bun.env.FACEIT_URL,
    withCredentials: true,
    headers: {
        Authorization: `Bearer ` + Bun.env.FACEIT_API_KEY,
        "Content-Type": "application/json",
        "Accept-Encoding": "gzip"
    }
})