// @flow strict
import * as React from 'react';
import { Link } from 'react-router-dom';
import logo from '../imgs/logo.png';
import axios from 'axios';
import { useState } from 'react';

function LOGIN() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await localStorage.clear();
            const res = await axios.post('/customer/login', { email, password });

            // Check the response and store the token
            console.log(res.data); // Debugging: See the response in console

            if (res.data.accesstoken) {
                localStorage.setItem('firstLogin', true);
                localStorage.setItem('accessToken', res.data.accesstoken);
                window.location.href = "/";
            } else {
                alert("Login failed. Please try again.");
            }
        } catch (err) {
            // Handle the error gracefully
            alert(err.response?.data?.msg || "An error occurred during login.");
        }
    };

    return (
        <div>
            <div className='row-4'>
                <div className="text-center p-5">
                    <img className='rounded-circle' src={logo} width="250px" alt="Logo" />
                    <div className="text-center m-5-auto">
                        <h2 className='text-black'>LOGIN</h2>
                        <form onSubmit={handleSubmit}>
                            <p>
                                <label>Email address</label><br/>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    name="email"
                                    required
                                />
                            </p>
                            <p>
                                <label>Password</label>
                                <Link to="/forgot"><label className="right-label">Forget password?</label></Link>
                                <br/>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    name="password"
                                    required
                                />
                            </p>
                            <p>
                                <button id="sub_btn" type="submit">Login</button>
                            </p>
                        </form>
                        <footer>
                            <h6 className='text-black'>First time? <Link to="/PriestSignup" className='text-black'>Create an account</Link>.</h6>
                            <h6><Link to="/" className='text-black'>Back to Homepage</Link>.</h6>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LOGIN;
