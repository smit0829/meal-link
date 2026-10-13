import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
});

async function run() {
    try {
        const res = await api.post("/auth/register", {
            "role": "donor",
            "name": "ayush",
            "email": "ayush@123",
            "password": "password123",
            "donorType": "restaurant",
            "organizationName": "",
            "phone": "123123",
            "address": "ahemdabad"
        });
        console.log("Success");
    } catch (err) {
        if (err.response) {
            console.log("Error Response Message:", err.response?.data?.message);
        } else {
            console.log("No error response");
        }
    }
}

run();
